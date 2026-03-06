import { Suspense } from "react";
import { EmbedLink } from "@/components/embed-link";
import { themeStats, subjects, themeIcons } from "@/lib/data";
import { getThemeColor } from "@/lib/theme-colors";
import {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link as LinkIcon, Brain, Settings,
  BookOpen, Layers, GraduationCap, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Leaf, Shield, Cloud, Database, Code, Smartphone,
  Briefcase, Link: LinkIcon, Brain, Settings,
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero header */}
      <div className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] bg-[#E5E7E0]/30 dark:bg-[#2a2b2f]/30 p-6">
        <h1 className="text-2xl font-bold text-[#23251D] dark:text-[#EAECF6]">
          Dashboard
        </h1>
        <p className="text-[15px] text-[#9EA096] mt-1">
          Préparation au Grand Oral — Vue d&apos;ensemble
        </p>
      </div>

      {/* Stats row */}
      <ul className="list-none m-0 p-0 grid grid-cols-3 gap-4">
        {[
          { label: "Total Sujets", value: subjects.length, icon: BookOpen, color: "text-[#EB9D2A]" },
          { label: "Thèmes", value: themeStats.length, icon: Layers, color: "text-[#8B5CF6]" },
          { label: "Domaine", value: "INFO", icon: GraduationCap, color: "text-[#10B981]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <li
            key={label}
            className="rounded-md border border-[#D2D3CC] dark:border-[#3a3b3f] p-4 bg-[#FDFDF8] dark:bg-[#1E1F23]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#9EA096] font-medium">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-[#23251D] dark:text-[#EAECF6]">{value}</div>
          </li>
        ))}
      </ul>

      {/* Themes grid */}
      <div>
        <h2 className="text-lg font-semibold text-[#23251D] dark:text-[#EAECF6] mb-4">Thèmes</h2>
        <ul className="list-none m-0 p-0 grid gap-3 sm:grid-cols-2">
          {themeStats.map(({ theme, slug, count }) => {
            const Icon = iconMap[themeIcons[theme]] ?? Settings;
            const color = getThemeColor(theme);
            return (
              <li key={slug}>
                <Suspense>
                  <EmbedLink
                    href={`/themes/${slug}`}
                    className="flex items-center gap-3 p-3 rounded-md border border-transparent
                      hover:border-[#D2D3CC] dark:hover:border-[#3a3b3f] hover:bg-[#E5E7E0]/30 dark:hover:bg-[#2a2b2f]/30
                      hover:translate-y-[-1px] active:translate-y-[1px] active:scale-[.99]
                      transition-all relative group"
                  >
                    <div className={`rounded-md p-2 ${color.bgLight} shrink-0`}>
                      <Icon className={`h-5 w-5 ${color.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-[#23251D] dark:text-[#EAECF6] truncate">
                        {theme}
                      </p>
                      <p className="text-[13px] text-[#9EA096]">
                        {count} sujet{count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 text-[12px] font-medium rounded-full bg-[#E5E7E0] dark:bg-[#2a2b2f] text-[#4D4F46] dark:text-[#9EA096]">
                      {count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#9EA096] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </EmbedLink>
                </Suspense>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
