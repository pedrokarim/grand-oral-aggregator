import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { themeStats, subjects, themeIcons } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link as LinkIcon, Brain, Settings,
  GraduationCap, BookOpen, Layers,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link: LinkIcon, Brain, Settings,
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Préparation au Grand Oral — Vue d&apos;ensemble
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sujets</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thèmes</CardTitle>
            <Layers className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{themeStats.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Domaine</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">INFO</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Thèmes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themeStats.map(({ theme, slug, count }) => {
            const Icon = iconMap[themeIcons[theme]] ?? Settings;
            const color = getThemeColor(theme);
            return (
              <Link key={slug} href={`/themes/${slug}`}>
                <Card className={`border-l-4 ${color.border} hover:shadow-md transition-all cursor-pointer h-full`}>
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className={`rounded-md p-2 ${color.bgLight}`}>
                      <Icon className={`h-5 w-5 ${color.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{theme}</CardTitle>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {count} sujet{count > 1 ? "s" : ""} de préparation
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
