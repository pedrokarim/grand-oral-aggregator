"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import {
  type AIProvider,
  providerLabels,
  providerModels,
} from "@/lib/settings";
import { Settings, Brain, Palette, Bell } from "lucide-react";

export default function SettingsPage() {
  const [settings, updateSettings] = useSettings();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration de l&apos;application et de l&apos;IA
          </p>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            Intelligence Artificielle
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Actualités
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fournisseur IA</CardTitle>
              <CardDescription>
                Configurez le fournisseur d&apos;IA pour générer des résumés automatiques des sujets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fournisseur</Label>
                <Select
                  value={settings.ai.provider}
                  onValueChange={(v) =>
                    updateSettings({
                      ai: {
                        ...settings.ai,
                        provider: v as AIProvider,
                        model: providerModels[v as AIProvider][0],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(providerLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Clé API</Label>
                <Input
                  type="password"
                  placeholder={
                    settings.ai.provider === "ollama"
                      ? "Pas nécessaire pour Ollama"
                      : "Entrez votre clé API..."
                  }
                  value={settings.ai.apiKey}
                  onChange={(e) =>
                    updateSettings({ ai: { ...settings.ai, apiKey: e.target.value } })
                  }
                  disabled={settings.ai.provider === "ollama"}
                />
              </div>

              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select
                  value={settings.ai.model}
                  onValueChange={(v) =>
                    updateSettings({ ai: { ...settings.ai, model: v } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels[settings.ai.provider].map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {settings.ai.provider === "ollama" && (
                <div className="space-y-2">
                  <Label>URL du serveur Ollama</Label>
                  <Input
                    placeholder="http://localhost:11434"
                    value={settings.ai.baseUrl ?? ""}
                    onChange={(e) =>
                      updateSettings({
                        ai: { ...settings.ai, baseUrl: e.target.value },
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé automatique</CardTitle>
              <CardDescription>
                Génère automatiquement un résumé IA lorsque vous ouvrez un sujet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Activer le résumé auto</p>
                  <p className="text-sm text-muted-foreground">
                    Utilise le fournisseur configuré ci-dessus
                  </p>
                </div>
                <Switch
                  checked={settings.autoSummarize}
                  onCheckedChange={(v) => updateSettings({ autoSummarize: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l&apos;apparence de l&apos;application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(v) => {
                    updateSettings({ theme: v as "light" | "dark" | "system" });
                    if (v === "dark") {
                      document.documentElement.classList.add("dark");
                    } else if (v === "light") {
                      document.documentElement.classList.remove("dark");
                    } else {
                      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                      document.documentElement.classList.toggle("dark", prefersDark);
                    }
                    localStorage.setItem("theme", v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Langue</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) =>
                    updateSettings({ language: v as "fr" | "en" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rafraîchissement des actualités</CardTitle>
              <CardDescription>
                Configurez la fréquence de mise à jour des actualités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Intervalle (en minutes)</Label>
                <Input
                  type="number"
                  min={30}
                  max={1440}
                  value={settings.newsRefreshInterval}
                  onChange={(e) =>
                    updateSettings({
                      newsRefreshInterval: parseInt(e.target.value) || 360,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Actuellement : toutes les {settings.newsRefreshInterval} minutes
                  ({(settings.newsRefreshInterval / 60).toFixed(1)}h)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
