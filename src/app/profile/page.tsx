"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, LogIn, Loader2 } from "lucide-react";
import { useSession, signIn } from "@/lib/auth-client";

interface UserPreferences {
  displayName: string | null;
  status: string;
  globalMentionOptOut: boolean;
  chatMentionOptOut: boolean;
  commentMentionOptOut: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setPrefsLoading(true);
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((data) => {
        setPrefs(data.preferences);
        setPrefsLoading(false);
      })
      .catch(() => setPrefsLoading(false));
  }, [session]);

  const updatePref = useCallback(async (key: string, value: unknown) => {
    setPrefs((prev) => prev ? { ...prev, [key]: value } : prev);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground">
            Gérez votre profil et vos préférences de mentions
          </p>
        </div>
      </div>

      {!session ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <User className="h-10 w-10 text-[#9EA096]" />
              <p className="text-[14px] text-[#9EA096]">
                Connectez-vous pour accéder à votre profil
              </p>
              <button
                onClick={() => {
                  if (window.top !== window.self) {
                    window.top!.location.href = "/api/auth/signin/discord";
                  } else {
                    signIn.social({ provider: "discord" });
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium
                  text-[#FDFDF8] bg-[#5865F2] hover:bg-[#4752C4] rounded-md transition-colors cursor-default"
              >
                <LogIn className="w-3.5 h-3.5" />
                Se connecter avec Discord
              </button>
            </div>
          </CardContent>
        </Card>
      ) : prefsLoading || !prefs ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#9EA096]" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identité</CardTitle>
              <CardDescription>Personnalisez votre profil public</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom d&apos;affichage</Label>
                <Input
                  placeholder={session.user.name}
                  value={prefs.displayName ?? ""}
                  onChange={(e) => updatePref("displayName", e.target.value || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour utiliser votre nom Discord
                </p>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={prefs.status}
                  onValueChange={(v) => updatePref("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🟢 En ligne</SelectItem>
                    <SelectItem value="idle">🟡 Absent</SelectItem>
                    <SelectItem value="dnd">🔴 Ne pas déranger</SelectItem>
                    <SelectItem value="invisible">⚫ Invisible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentions</CardTitle>
              <CardDescription>
                Contrôlez qui peut vous mentionner avec @
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px]">Bloquer toutes les mentions</p>
                  <p className="text-sm text-muted-foreground">
                    Personne ne pourra vous mentionner
                  </p>
                </div>
                <Switch
                  checked={prefs.globalMentionOptOut}
                  onCheckedChange={(v) => updatePref("globalMentionOptOut", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px]">Bloquer les mentions dans le chat</p>
                  <p className="text-sm text-muted-foreground">
                    Vous ne serez pas suggéré dans le chat global
                  </p>
                </div>
                <Switch
                  checked={prefs.chatMentionOptOut}
                  onCheckedChange={(v) => updatePref("chatMentionOptOut", v)}
                  disabled={prefs.globalMentionOptOut}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px]">Bloquer les mentions dans les commentaires</p>
                  <p className="text-sm text-muted-foreground">
                    Vous ne serez pas suggéré dans les commentaires de thèmes
                  </p>
                </div>
                <Switch
                  checked={prefs.commentMentionOptOut}
                  onCheckedChange={(v) => updatePref("commentMentionOptOut", v)}
                  disabled={prefs.globalMentionOptOut}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
