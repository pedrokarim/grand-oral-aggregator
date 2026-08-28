import "server-only";

import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from "jose";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { prisma } from "@/lib/prisma";

export const ASCENCIA_SESSION_COOKIE = "grand_oral_ascencia_session";
const APPLICATION_SLUG = "grand-oral-aggregator";

export interface AscenciaUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  locale: string | null;
}

export interface AscenciaClaims extends JWTPayload {
  app?: string;
  roles?: string[];
  prole?: string[];
}

export interface AppSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    displayName: string | null;
    status: string;
    role: string;
  };
  ascencia: {
    accountId: string;
    roles: string[];
    platformRoles: string[];
  };
}

interface StoredSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  claims: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

interface TokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
}

let cachedKeys: { issuer: string; keys: JWTVerifyGetKey } | null = null;
const refreshes = new Map<string, Promise<StoredSession | null>>();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} est obligatoire.`);
  return value;
}

function clientConfig() {
  return {
    issuer: requiredEnv("ASCENCIA_ISSUER").replace(/\/$/, ""),
    clientId: requiredEnv("ASCENCIA_CLIENT_ID"),
    clientSecret: requiredEnv("ASCENCIA_CLIENT_SECRET"),
  };
}

function encryptionKey(): Buffer {
  return createHash("sha256")
    .update(requiredEnv("ASCENCIA_SESSION_SECRET"))
    .digest();
}

/** Les jetons OAuth restent chiffrés au repos dans la base applicative. */
function encrypt(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decrypt(value: string): string {
  const [version, encodedIv, encodedTag, encodedCiphertext] = value.split(".");
  if (version !== "v1" || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Session Ascencia illisible.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function signingKeys(issuer: string): JWTVerifyGetKey {
  if (cachedKeys?.issuer === issuer) return cachedKeys.keys;
  const keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  cachedKeys = { issuer, keys };
  return keys;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function verifyAccessToken(token: string): Promise<AscenciaClaims> {
  const config = clientConfig();
  const { payload } = await jwtVerify(token, signingKeys(config.issuer), {
    issuer: config.issuer,
    audience: config.clientId,
    algorithms: ["ES256"],
    requiredClaims: ["iss", "aud", "sub", "exp"],
    clockTolerance: 5,
  });
  const claims = payload as AscenciaClaims;
  if (claims.app !== APPLICATION_SLUG) {
    throw new Error("Le jeton ne cible pas Grand Oral Aggregator.");
  }
  return claims;
}

async function requestTokens(fields: Record<string, string>): Promise<Tokens> {
  const config = clientConfig();
  const response = await fetch(`${config.issuer}/oauth/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      ...fields,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error(`Échange Ascencia ID refusé (${response.status}).`);
  }

  return {
    accessToken: payload.access_token,
    refreshToken:
      typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    expiresAt:
      Date.now() +
      (typeof payload.expires_in === "number" ? payload.expires_in : 600) *
        1_000,
  };
}

async function loadUser(accessToken: string): Promise<AscenciaUser> {
  const response = await fetch(`${clientConfig().issuer}/oauth/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Profil Ascencia ID indisponible (${response.status}).`);
  }

  const claims = (await response.json()) as Record<string, unknown>;
  if (typeof claims.sub !== "string" || claims.sub.length === 0) {
    throw new Error("Ascencia ID n’a pas renvoyé de profil.");
  }

  const optionalString = (value: unknown) =>
    typeof value === "string" && value.length > 0 ? value : null;
  return {
    id: claims.sub,
    email: optionalString(claims.email),
    emailVerified: claims.email_verified === true,
    displayName: optionalString(claims.name),
    username: optionalString(claims.preferred_username),
    avatarUrl: optionalString(claims.picture),
    locale: optionalString(claims.locale),
  };
}

/**
 * Conserve l'identifiant local : les messages, commentaires, préférences et
 * sujets déjà créés restent ainsi attachés au même profil applicatif.
 */
async function linkLocalUser(profile: AscenciaUser) {
  if (!profile.email || !profile.emailVerified) {
    throw new Error("Une adresse vérifiée est nécessaire pour Grand Oral.");
  }

  const email = profile.email.trim().toLowerCase();
  const name =
    profile.displayName ?? profile.username ?? email.split("@")[0] ?? "Membre";

  return prisma.$transaction(async (tx) => {
    const linked = await tx.user.findUnique({
      where: { ascenciaAccountId: profile.id },
    });

    if (linked) {
      const emailOwner = await tx.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });
      return tx.user.update({
        where: { id: linked.id },
        data: {
          name,
          emailVerified: true,
          ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
          ...(!emailOwner || emailOwner.id === linked.id ? { email } : {}),
        },
      });
    }

    const legacy = await tx.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (legacy) {
      return tx.user.update({
        where: { id: legacy.id },
        data: {
          ascenciaAccountId: profile.id,
          name,
          email,
          emailVerified: true,
          ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
        },
      });
    }

    return tx.user.create({
      data: {
        ascenciaAccountId: profile.id,
        name,
        email,
        emailVerified: true,
        image: profile.avatarUrl,
      },
    });
  });
}

/** Échange le code du widget côté serveur et crée la session applicative. */
export async function createAscenciaSession(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<string> {
  const tokens = await requestTokens({
    grant_type: "authorization_code",
    code: input.code,
    code_verifier: input.codeVerifier,
    redirect_uri: input.redirectUri,
  });
  const claims = await verifyAccessToken(tokens.accessToken);
  const profile = await loadUser(tokens.accessToken);
  if (claims.sub !== profile.id) {
    throw new Error("Le jeton et le profil Ascencia ne correspondent pas.");
  }
  const user = await linkLocalUser(profile);

  const id = randomBytes(32).toString("base64url");
  await prisma.ascenciaSession.create({
    data: {
      id,
      userId: user.id,
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expiresAt: new Date(tokens.expiresAt),
      claims: JSON.stringify(claims),
    },
  });
  return id;
}

export async function readAscenciaSession(
  id: string | null | undefined,
): Promise<AppSession | null> {
  if (!id) return null;

  const stored = await prisma.ascenciaSession.findUnique({ where: { id } });
  if (!stored) return null;

  try {
    const fresh =
      stored.expiresAt.getTime() > Date.now() + 30_000
        ? stored
        : await refreshSessionOnce(stored);
    if (!fresh) return null;

    const claims = JSON.parse(fresh.claims) as AscenciaClaims;
    if (claims.app !== APPLICATION_SLUG || typeof claims.sub !== "string") {
      await prisma.ascenciaSession.deleteMany({ where: { id } });
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: fresh.userId } });
    if (!user || user.ascenciaAccountId !== claims.sub) {
      await prisma.ascenciaSession.deleteMany({ where: { id } });
      return null;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        displayName: user.displayName,
        status: user.status,
        role: user.role,
      },
      ascencia: {
        accountId: user.ascenciaAccountId,
        roles: stringList(claims.roles),
        platformRoles: stringList(claims.prole),
      },
    };
  } catch {
    await prisma.ascenciaSession.deleteMany({ where: { id } });
    return null;
  }
}

export async function deleteAscenciaSession(
  id: string | null | undefined,
): Promise<void> {
  if (!id) return;
  const stored = await prisma.ascenciaSession.findUnique({ where: { id } });
  if (!stored) return;

  if (stored.refreshToken) {
    try {
      const config = clientConfig();
      await fetch(`${config.issuer}/oauth/revoke`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: decrypt(stored.refreshToken),
          token_type_hint: "refresh_token",
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
        cache: "no-store",
      });
    } catch {
      // La session locale doit pouvoir être fermée même si l'IdP est indisponible.
    }
  }

  await prisma.ascenciaSession.deleteMany({ where: { id } });
}

function refreshSessionOnce(stored: StoredSession): Promise<StoredSession | null> {
  const current = refreshes.get(stored.id);
  if (current) return current;

  const pending = refreshSession(stored);
  const release = () => {
    if (refreshes.get(stored.id) === pending) refreshes.delete(stored.id);
  };
  refreshes.set(stored.id, pending);
  pending.then(release, release);
  return pending;
}

async function refreshSession(
  stored: StoredSession,
): Promise<StoredSession | null> {
  if (!stored.refreshToken) {
    await prisma.ascenciaSession.deleteMany({ where: { id: stored.id } });
    return null;
  }

  const currentRefreshToken = decrypt(stored.refreshToken);
  const tokens = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
  });
  const claims = await verifyAccessToken(tokens.accessToken);
  const profile = await loadUser(tokens.accessToken);
  if (claims.sub !== profile.id) {
    await prisma.ascenciaSession.deleteMany({ where: { id: stored.id } });
    return null;
  }

  const linkedUser = await linkLocalUser(profile);
  if (linkedUser.id !== stored.userId) {
    await prisma.ascenciaSession.deleteMany({ where: { id: stored.id } });
    return null;
  }

  const refreshToken = tokens.refreshToken ?? currentRefreshToken;
  return prisma.ascenciaSession.update({
    where: { id: stored.id },
    data: {
      accessToken: encrypt(tokens.accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: new Date(tokens.expiresAt),
      claims: JSON.stringify(claims),
    },
  });
}
