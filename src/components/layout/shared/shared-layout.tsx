import {DocsLayout} from "fumadocs-ui/layouts/docs";
import {HomeLayout} from "fumadocs-ui/layouts/home";
import type {ReactNode} from "react";
import {baseOptions} from "@/lib/layout.shared";
import type {Root} from "fumadocs-core/page-tree";
import {Background} from "@/components/layout/home/background";
import {SidebarBanner} from "./sidebar-banner";
import {SidebarFolderItem} from "./sidebar-folder-item";
import {Sidebar, SidebarProvider, SidebarTrigger, useSidebar} from "fumadocs-ui/layouts/docs/slots/sidebar";
import {FullSearchTrigger, SearchTrigger} from "@/components/search-trigger";
import {Menu} from "lucide-react";
import {cn} from "cn";
import {buttonVariants} from "@/components/ui/button";
import {m} from "@/paraglide/messages";

interface LayoutProps {
  lang: string;
  searchToggle?: boolean;
  sidebar?: boolean;
  isApiPage?: boolean;
  backUrl?: string;
  children: ReactNode;
  dataTree: object;
  sectionLinks?: {
    home: string;
    sdk: string;
    api: string;
  };
  treeKey?: string;
}

type LayoutWidthClasses = {
  layoutWidthClass: string;
  docsLayoutWidthClass: string;
};

type DocsLayoutPropsConfig = {
  tree: Root;
  backUrl?: string;
  options: ReturnType<typeof baseOptions>;
  docsLayoutWidthClass: string;
  searchToggle: boolean;
  sidebar: boolean;
};

function getLayoutWidthClasses(isApiPage: boolean): LayoutWidthClasses {
  return {
    layoutWidthClass: isApiPage ? "xl:[--fd-layout-width:2200px]" : "xl:[--fd-layout-width:1760px]",
    docsLayoutWidthClass: isApiPage ? "xl:layout:[--fd-layout-width:2200px]" : "xl:layout:[--fd-layout-width:1760px]",
  };
}

function buildDocsLayoutProps({tree, backUrl, options, docsLayoutWidthClass, searchToggle, sidebar}: DocsLayoutPropsConfig) {
  return {
    tree,
    ...options,
    containerProps: {
      className: docsLayoutWidthClass,
    },
    nav: {
      ...options.nav,
      enabled: false,
      title: null,
      children: null,
    },
    searchToggle: {
      enabled: searchToggle,
    },
    themeSwitch: {
      enabled: false,
    },
    tabs: false as const,
    slots: {
      ...options.slots,
      // The top navbar already renders the language switcher; hide the
      // duplicate in the docs sidebar (footer + mobile drawer).
      languageSelect: false as const,
      sidebar: {
        provider: ({children}: {children?: ReactNode}) => <>{children}</>,
        root: Sidebar,
        trigger: SidebarTrigger,
        useSidebar,
      },
    },
    sidebar: {
      enabled: sidebar,
      banner: <SidebarBanner backUrl={backUrl} />,
      footer: null,
      collapsible: false,
      className: "[&_div:empty]:hidden [&>div:first-child]:p-6 [&>div:first-child]:!gap-3 [&_[data-radix-scroll-area-viewport]]:pt-2",
      components: {
        Folder: SidebarFolderItem,
      },
    },
  };
}

function MobileSidebarTrigger() {
  const {open} = useSidebar();
  return (
    <SidebarTrigger
      aria-label={open ? m.closeSidebar() : m.openSidebar()}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size: "icon-sm",
        }),
        "p-2 md:hidden"
      )}
    >
      <Menu className="size-5" />
    </SidebarTrigger>
  );
}

function MobileSearchWithSidebarTrigger({
  sidebar,
  searchEnabled,
  ...props
}: {
  sidebar: boolean;
  searchEnabled: boolean;
} & Parameters<typeof SearchTrigger>[0]) {
  return (
    <>
      {searchEnabled && <SearchTrigger {...props} />}
      {sidebar && <MobileSidebarTrigger />}
    </>
  );
}

function buildHomeLayoutSlots(options: ReturnType<typeof baseOptions>, searchToggle: boolean, sidebar: boolean) {
  return {
    ...options.slots,
    searchTrigger: {
      full: searchToggle ? FullSearchTrigger : () => null,
      sm: (props: Parameters<typeof SearchTrigger>[0]) => (
        <MobileSearchWithSidebarTrigger sidebar={sidebar} searchEnabled={searchToggle} {...props} />
      ),
    },
  };
}

export default function SharedLayout({
  lang,
  searchToggle = true,
  sidebar = true,
  isApiPage = false,
  backUrl,
  dataTree,
  sectionLinks,
  treeKey,
  children,
}: LayoutProps) {
  const tree = dataTree as Root;
  const options = baseOptions(lang, sectionLinks);
  const {layoutWidthClass, docsLayoutWidthClass} = getLayoutWidthClasses(isApiPage);
  const docsLayoutProps = buildDocsLayoutProps({
    tree,
    backUrl,
    options,
    docsLayoutWidthClass,
    searchToggle,
    sidebar,
  });
  const homeLayoutSlots = buildHomeLayoutSlots(options, searchToggle, sidebar);

  return (
    <SidebarProvider>
      <div className="relative z-10 flex min-h-svh flex-col">
        <Background />
        <HomeLayout
          {...options}
          searchToggle={{
            enabled: searchToggle || sidebar,
          }}
          slots={homeLayoutSlots}
          className={`flex-1 ${layoutWidthClass}`}
        >
          <DocsLayout key={treeKey} {...docsLayoutProps}>
            {children}
          </DocsLayout>
        </HomeLayout>
      </div>
    </SidebarProvider>
  );
}
