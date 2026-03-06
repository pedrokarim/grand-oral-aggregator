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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import {
  type AIProvider,
  providerLabels,
  providerModels,
} from "@/lib/settings";
import { Settings, Brain, Palette, Bell, RotateCcw, RefreshCw, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, updateSettings] = useSettings();
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const fetchOllamaModels = useCallback(async () => {
    const baseUrl = settings.ai.baseUrl || "http://localhost:11434";
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const res = await fetch(`${baseUrl}/api/tags`);
      const data = await res.json();
      const models = (data.models ?? []).map((m: { name: string }) => m.name);
      setOllamaModels(models);
      if (models.length > 0 && !models.includes(settings.ai.model)) {
        updateSettings({ ai: { model: models[0] } });
      }
    } catch {
      setOllamaError("Impossible de contacter Ollama");
      setOllamaModels([]);
    } finally {
      setOllamaLoading(false);
    }
  }, [settings.ai.baseUrl, settings.ai.model]);

  useEffect(() => {
    if (settings.ai.provider === "ollama") {
      fetchOllamaModels();
    }
  }, [settings.ai.provider, fetchOllamaModels]);

  return (
    <div className="space-y-8 p-6">
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
          <TabsTrigger value="reset" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialisation
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
                  onValueChange={(v) => {
                    const provider = v as AIProvider;
                    updateSettings({
                      ai: {
                        ...settings.ai,
                        provider,
                        model: provider === "ollama" ? "" : providerModels[provider][0],
                      },
                    });
                  }}
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
                <div className="flex items-center justify-between">
                  <Label>Modèle</Label>
                  {settings.ai.provider === "ollama" && (
                    <button
                      onClick={fetchOllamaModels}
                      disabled={ollamaLoading}
                      className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-default"
                    >
                      {ollamaLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Rafraîchir
                    </button>
                  )}
                </div>
                {settings.ai.provider === "ollama" ? (
                  <>
                    {ollamaError && (
                      <p className="text-[12px] text-destructive">{ollamaError}</p>
                    )}
                    {ollamaModels.length > 0 ? (
                      <Select
                        value={settings.ai.model}
                        onValueChange={(v) =>
                          updateSettings({ ai: { ...settings.ai, model: v } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un modèle..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ollamaModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">
                        {ollamaLoading
                          ? "Chargement des modèles..."
                          : "Aucun modèle installé. Lancez `ollama pull qwen3:8b` pour en installer un."}
                      </p>
                    )}
                  </>
                ) : (
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
                )}
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

        <TabsContent value="reset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Icônes du bureau</CardTitle>
              <CardDescription>
                Réinitialisez la position des icônes du bureau à leur emplacement par défaut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Positions des icônes</p>
                  <p className="text-sm text-muted-foreground">
                    Remet toutes les icônes à leur position initiale en grille
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Tell the parent desktop to reset icons via postMessage
                    // jotai atomWithStorage handles localStorage automatically
                    window.parent.postMessage({ type: "reset-icons" }, "*");
                  }}
                  className="text-[13px] font-bold text-[#FDFDF8] px-4 py-1.5 rounded-sm cursor-default
                    bg-[#EB9D2A] border-b-[3px] border-[#B17816] shadow-[0_2px_0_#CD8407]
                    hover:translate-y-[-1px] hover:shadow-[0_3px_0_#CD8407] active:translate-y-0 active:shadow-none
                    transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
