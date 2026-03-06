"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import type { ThemeColor } from "@/lib/theme-colors";

interface SubjectCardProps {
  sujet: string;
  type: string;
  domaine: string;
  theme: string;
  color: ThemeColor;
}

export function SubjectCard({ sujet, type, domaine, theme, color }: SubjectCardProps) {
  const [settings] = useSettings();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function generateSummary() {
    if (summary) {
      setOpen(!open);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sujet,
          theme,
          provider: settings.ai.provider,
          apiKey: settings.ai.apiKey,
          model: settings.ai.model,
          baseUrl: settings.ai.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de génération");
    } finally {
      setLoading(false);
    }
  }

  const hasAIConfig = settings.ai.apiKey || settings.ai.provider === "ollama";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={`border-l-4 ${color.border}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-medium leading-snug">
              {sujet}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {hasAIConfig && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      generateSummary();
                    }}
                    disabled={loading}
                    className="gap-1.5 text-xs"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    {summary ? (open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : "Résumé IA"}
                  </Button>
                </CollapsibleTrigger>
              )}
              <Badge variant="outline" className="text-xs">
                {type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">{domaine}</Badge>
            <Badge className={`${color.bgLight} ${color.text} border-0 text-xs`}>
              {theme}
            </Badge>
          </div>

          {loading && (
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive pt-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <CollapsibleContent>
            {summary && (
              <div className="rounded-lg bg-muted/50 p-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Résumé généré par IA</span>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
                  {summary}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
