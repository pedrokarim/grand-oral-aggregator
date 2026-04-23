import type { SearchLayout } from "@/lib/settings";
import type { SearchLayoutProps } from "./types";
import { CenteredMinimalLayout } from "./centered-minimal";
import { SidebarListLayout } from "./sidebar-list";
import { TopGridLayout } from "./top-grid";
import { SplitHeroLayout } from "./split-hero";
import { CommandPaletteLayout } from "./command-palette";
import { MasonryEditorialLayout } from "./masonry-editorial";

export const SEARCH_LAYOUT_COMPONENTS: Record<SearchLayout, React.ComponentType<SearchLayoutProps>> = {
  "centered-minimal": CenteredMinimalLayout,
  "sidebar-list": SidebarListLayout,
  "top-grid": TopGridLayout,
  "split-hero": SplitHeroLayout,
  "command-palette": CommandPaletteLayout,
  "masonry-editorial": MasonryEditorialLayout,
};

export type { SearchLayoutData, SearchLayoutProps } from "./types";
