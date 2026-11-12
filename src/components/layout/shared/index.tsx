import type {I18nConfig} from "fumadocs-core/i18n";
import type {FullSearchTriggerProps, SearchTriggerProps} from "fumadocs-ui/layouts/shared/slots/search-trigger";
import type {FC, HTMLAttributes, ReactNode} from "react";

interface NavOptions {
  enabled: boolean;
  component: ReactNode;

  title?: ReactNode;

  /**
   * Redirect url of title
   * @defaultValue '/'
   */
  url?: string;

  /**
   * Use transparent background
   *
   * @defaultValue 'none'
   */
  transparentMode?: "always" | "top" | "none";

  children?: ReactNode;
}

export interface BaseLayoutProps {
  themeSwitch?: {
    enabled?: boolean;
    component?: ReactNode;
    mode?: "light-dark" | "light-dark-system";
  };

  searchToggle?: Partial<{
    enabled: boolean;
    components: Partial<{
      sm: ReactNode;
      lg: ReactNode;
    }>;
  }>;

  /**
   * Remove theme switcher component
   *
   * @deprecated Use `themeSwitch.enabled` instead.
   */
  disableThemeSwitch?: boolean;

  /**
   * I18n options
   *
   * @defaultValue false
   */
  i18n?: boolean | I18nConfig;

  /**
   * GitHub url
   */
  githubUrl?: string;

  links?: LinkItemType[];
  /**
   * Replace or disable navbar
   */
  nav?: Partial<NavOptions>;

  /**
   * Slot overrides forwarded to the fumadocs layout. Currently we only use
   * `searchTrigger` to swap in paraglide-driven components; other slots
   * remain the fumadocs defaults.
   */
  slots?: {
    searchTrigger?:
      | {
          sm: FC<SearchTriggerProps>;
          full: FC<FullSearchTriggerProps>;
        }
      | false;
  };

  children?: ReactNode;
}

interface BaseItem {
  /**
   * Restrict where the item is displayed
   *
   * @defaultValue 'all'
   */
  on?: "menu" | "nav" | "all";
}

interface BaseLinkType extends BaseItem {
  url: string;
  /**
   * When the item is marked as active
   *
   * @defaultValue 'url'
   */
  active?: "url" | "nested-url" | "none";
  activeSubfolders?: string[];
  external?: boolean;
}

interface MainItemType extends BaseLinkType {
  type?: "main";
  icon?: ReactNode;
  text: ReactNode;
  description?: ReactNode;
}

interface IconItemType extends BaseLinkType {
  type: "icon";
  /**
   * `aria-label` of icon button
   */
  label?: string;
  icon: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue true
   */
  secondary?: boolean;
}

interface ButtonItemType extends BaseLinkType {
  type: "button";
  icon?: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

interface MenuItemType extends BaseItem {
  type: "menu";
  icon?: ReactNode;
  text: ReactNode;

  url?: string;
  items: (
    | (MainItemType & {
        /**
         * Options when displayed on navigation menu
         */
        menu?: HTMLAttributes<HTMLElement> & {
          banner?: ReactNode;
        };
      })
    | CustomItemType
  )[];

  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

interface CustomItemType extends BaseItem {
  type: "custom";
  /**
   * @defaultValue false
   */
  secondary?: boolean;
  children: ReactNode;
}

type LinkItemType = MainItemType | IconItemType | ButtonItemType | MenuItemType | CustomItemType;
