-- Rattache le profil applicatif existant à l'identité centrale sans modifier
-- les clés étrangères du chat, des commentaires ou des sujets personnels.
ALTER TABLE "User" ADD COLUMN "ascenciaAccountId" TEXT;

CREATE UNIQUE INDEX "User_ascenciaAccountId_key"
ON "User"("ascenciaAccountId");

CREATE TABLE "AscenciaSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claims" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AscenciaSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AscenciaSession_userId_idx" ON "AscenciaSession"("userId");
CREATE INDEX "AscenciaSession_expiresAt_idx" ON "AscenciaSession"("expiresAt");

ALTER TABLE "AscenciaSession"
ADD CONSTRAINT "AscenciaSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Les anciennes sessions Better Auth ne sont plus acceptées. Les jetons du
-- fournisseur sont effacés, mais le lien historique est conservé pour audit.
DELETE FROM "Session";
UPDATE "Account"
SET "accessToken" = NULL,
    "refreshToken" = NULL,
    "idToken" = NULL,
    "accessTokenExpiresAt" = NULL,
    "refreshTokenExpiresAt" = NULL;
