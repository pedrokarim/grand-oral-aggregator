"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { sanitizeDescription } from "@/lib/utils";
import { getThemeColor } from "@/lib/theme-colors";
import type { NewsArticle } from "@/lib/news";

export function NewsFeed({ theme }: { theme?: string }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = theme
      ? `/api/news?theme=${encodeURIComponent(theme)}`
      : `/api/news`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les actualités");
        setLoading(false);
      });
  }, [theme]);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Aucune actualité disponible pour le moment. Lancez le cron pour récupérer les news.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {articles.map((article, i) => {
        const color = getThemeColor(article.theme);
        return (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className={`border-l-4 ${color.border} hover:shadow-md transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium leading-snug line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 break-words overflow-hidden">
                  {sanitizeDescription(article.description)}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">{article.source}</Badge>
                  <Badge className={`${color.bgLight} ${color.text} border-0 text-xs`}>
                    {article.theme}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
