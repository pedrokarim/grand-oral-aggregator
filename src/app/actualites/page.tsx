import { Newspaper } from "lucide-react";
import { NewsFeed } from "@/components/news-feed";

export default function ActualitesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Newspaper className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actualités</h1>
          <p className="text-muted-foreground">
            Dernières actualités liées aux thèmes du Grand Oral
          </p>
        </div>
      </div>

      <NewsFeed />
    </div>
  );
}
