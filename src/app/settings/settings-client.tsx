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
  type SummaryLength,
  providerLabels,
  providerModels,
  summaryLengthLabels,
} from "@/lib/settings";
import { Settings, Brain, Palette, Bell, RotateCcw, RefreshCw, Loader2, Volume2, Play, Square } from "lucide-react";
import { useVoices } from "@/hooks/use-voices";
import { speak, stopSpeaking } from "@/lib/tts";

const TTS_SAMPLE = "Bonjour, ceci est un test de la synthèse vocale pour le Grand Oral.";

export default function SettingsPage() {
  const [settings, updateSettings] = useSettings();
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const voices = useVoices();
  const [ttsTesting, setTtsTesting] = useState(false);

  const filteredVoices = voices.filter((v) =>
    settings.tts.lang ? v.lang.startsWith(settings.tts.lang.slice(0, 2)) : true
  );
  const allLangs = Array.from(new Set(voices.map((v) => v.lang))).sort();

  function testVoice() {
    setTtsTesting(true);
    const utter = speak(TTS_SAMPLE, settings.tts);
    if (!utter) {
      setTtsTesting(false);
      return;
    }
    utter.onend = () => setTtsTesting(false);
    utter.onerror = () => setTtsTesting(false);
  }

  function stopTest() {
    stopSpeaking();
    setTtsTesting(false);
  }

  const fetchOllamaModels = useCallback(async () => {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const params = new URLSearchParams();
      if (settings.ai.baseUrl) params.set("baseUrl", settings.ai.baseUrl);
      const res = await fetch(`/api/ai/ollama/tags?${params}`);
      if (!res.ok) throw new Error("Impossible de joindre Ollama");
      const data = await res.json();
      const models = (data.models ?? []).map((m: { name: string }) => m.name);
      setOllamaModels(models);
      if (models.length > 0 && !models.includes(settings.ai.model)) {
        updateSettings({ ai: { ...settings.ai, model: models[0] } });
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
          <TabsTrigger value="voice" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Synthèse vocale
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
                      <Input
                        placeholder={
                          ollamaLoading
                            ? "Chargement des modèles..."
                            : "Nom du modèle, ex: qwen3:4b"
                        }
                        value={settings.ai.model}
                        onChange={(e) =>
                          updateSettings({ ai: { ...settings.ai, model: e.target.value } })
                        }
                      />
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

          <Card>
            <CardHeader>
              <CardTitle>Longueur des résumés</CardTitle>
              <CardDescription>
                Contrôle le niveau de détail des résumés IA générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={settings.summaryLength}
                  onValueChange={(v) =>
                    updateSettings({ summaryLength: v as SummaryLength })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(summaryLengthLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Les résumés déjà générés sont mis en cache par longueur — changer ici régénérera lors du prochain clic.
                </p>
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

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synthèse vocale</CardTitle>
              <CardDescription>
                Lit les résumés IA et les articles à voix haute via le navigateur (Web Speech API)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select
                  value={settings.tts.lang}
                  onValueChange={(v) => {
                    const matching = voices.find((vc) => vc.lang.startsWith(v.slice(0, 2)));
                    updateSettings({
                      tts: {
                        lang: v,
                        voiceURI: matching?.voiceURI ?? "",
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allLangs.length === 0 ? (
                      <SelectItem value="fr-FR">fr-FR</SelectItem>
                    ) : (
                      allLangs.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Voix</Label>
                {filteredVoices.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">
                    Aucune voix disponible pour cette langue. Installez une voix système ou changez de langue.
                  </p>
                ) : (
                  <Select
                    value={settings.tts.voiceURI || filteredVoices[0]?.voiceURI || ""}
                    onValueChange={(v) => updateSettings({ tts: { voiceURI: v } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVoices.map((v) => (
                        <SelectItem key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang}){v.default ? " — défaut" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Vitesse</Label>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {settings.tts.rate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={settings.tts.rate}
                  onChange={(e) => updateSettings({ tts: { rate: parseFloat(e.target.value) } })}
                  className="w-full accent-[#EB9D2A]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hauteur (pitch)</Label>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {settings.tts.pitch.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={settings.tts.pitch}
                  onChange={(e) => updateSettings({ tts: { pitch: parseFloat(e.target.value) } })}
                  className="w-full accent-[#EB9D2A]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {Math.round(settings.tts.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.tts.volume}
                  onChange={(e) => updateSettings({ tts: { volume: parseFloat(e.target.value) } })}
                  className="w-full accent-[#EB9D2A]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D2D3CC] dark:border-[#3a3b3f]">
                <div>
                  <p className="font-medium">Lecture automatique</p>
                  <p className="text-sm text-muted-foreground">
                    Lit automatiquement les résumés IA dès leur génération
                  </p>
                </div>
                <Switch
                  checked={settings.tts.autoPlay}
                  onCheckedChange={(v) => updateSettings({ tts: { autoPlay: v } })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                {!ttsTesting ? (
                  <button
                    onClick={testVoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                      border border-[#D2D3CC] dark:border-[#3a3b3f]
                      text-[#4D4F46] dark:text-[#9EA096]
                      hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                      transition-colors cursor-default"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Tester la voix
                  </button>
                ) : (
                  <button
                    onClick={stopTest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md
                      border border-[#D2D3CC] dark:border-[#3a3b3f]
                      text-[#4D4F46] dark:text-[#9EA096]
                      hover:bg-[#E5E7E0]/50 dark:hover:bg-[#2a2b2f]
                      transition-colors cursor-default"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Arrêter
                  </button>
                )}
                <span className="text-[12px] text-muted-foreground italic">
                  &laquo; {TTS_SAMPLE} &raquo;
                </span>
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
