import type {BaseLayoutProps} from "@/components/layout/shared";
import {FooterSection} from "@/components/layout/footer/footer-content-section.tsx";
import {DiscordIcon, GithubIcon, LogoWide, XIcon, YoutubeIcon} from "@/components/icons";
import {ArrowUpRightIcon} from "lucide-react";
import {ThemeToggle} from "@/components/theme-toggle";
import {FullSearchTrigger, SearchTrigger} from "@/components/search-trigger";
import {m} from "@/paraglide/messages.js";
import {locales} from "@/paraglide/runtime";

type Locale = (typeof locales)[number];

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/shared-layout.tsx
 * Docs Layout: app/docs/shared-layout.tsx
 */
export function baseOptions(
  lang: string,
  sectionLinks?: {
    home: string;
    sdk: string;
    api: string;
  }
): BaseLayoutProps {
  return baseOptionsWithSectionLinks(lang, sectionLinks);
}

type SectionLinks = {
  home: string;
  sdk: string;
  api: string;
};

function buildPrimaryLink(text: string, url: string) {
  return {
    text,
    url,
    on: "nav" as const,
    active: "nested-url" as const,
    activeSubfolders: [url],
  };
}

function buildNavLinks(lang: string) {
  const homeUrl = `/${lang}/home`;
  const sdkUrl = `/${lang}/sdk`;
  const apiUrl = `/${lang}/api`;

  return [
    buildPrimaryLink(m.home({}, {locale: lang as Locale}), homeUrl),
    buildPrimaryLink(m.sdk({}, {locale: lang as Locale}), sdkUrl),
    buildPrimaryLink(m.api({}, {locale: lang as Locale}), apiUrl),
    {
      type: "button" as const,
      on: "nav" as const,
      text: (
        <>
          Dashboard <ArrowUpRightIcon className="size-4" />
        </>
      ),
      url: "https://dash.rixl.com",
      secondary: true,
    },
    {
      type: "custom" as const,
      on: "nav" as const,
      secondary: true,
      children: <ThemeToggle />,
    },
  ];
}

export function baseOptionsWithSectionLinks(lang: string, _sectionLinks?: SectionLinks): BaseLayoutProps {
  return {
    nav: {
      title: <LogoWide className="h-8 fill-black dark:invert" />,
      transparentMode: "top",
    },
    themeSwitch: {
      enabled: false,
    },
    // Route the search triggers through our local components so their
    // labels come from paraglide instead of fumadocs' translation table.
    slots: {
      searchTrigger: {
        sm: SearchTrigger,
        full: FullSearchTrigger,
      },
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: buildNavLinks(lang),
  };
}

function footerResourcesSection(lang: string, locale: Locale): FooterSection {
  return {
    title: m.footerResources({}, {locale}),
    links: [
      {text: m.footerApi({}, {locale}), url: `/${lang}/api`},
      {text: m.footerDocumentation({}, {locale}), url: `/${lang}/home/getting-started/overview`},
      {text: m.footerGuides({}, {locale}), url: `/${lang}/home/guides`},
      {text: m.footerExamples({}, {locale}), url: `/${lang}/sdk/media-react/examples`},
    ],
  };
}

function footerSupportSection(lang: string, locale: Locale): FooterSection {
  return {
    title: m.footerSupport({}, {locale}),
    links: [
      {text: m.footerHelpCenter({}, {locale}), url: `/${lang}/help`},
      {text: m.footerCommunity({}, {locale}), url: `/${lang}/community`},
      {text: m.footerContact({}, {locale}), url: `/${lang}/contact`},
      {text: m.footerStatus({}, {locale}), url: `/${lang}/status`},
    ],
  };
}

function footerCompanySection(lang: string, locale: Locale): FooterSection {
  return {
    title: m.footerCompany({}, {locale}),
    links: [
      {text: "rixl.com", url: "https://www.rixl.com"},
      {text: m.footerAbout({}, {locale}), url: `/${lang}/home/getting-started/overview`},
      {text: m.footerBlog({}, {locale}), url: "https://www.rixl.com/blog"},
      {text: m.footerCareers({}, {locale}), url: "https://www.rixl.com/careers"},
      {text: m.footerPrivacy({}, {locale}), url: `/${lang}/home/legal/privacy-policy`},
    ],
  };
}

function footerToolsSection(lang: string, locale: Locale): FooterSection {
  return {
    title: m.footerTools({}, {locale}),
    links: [
      {text: m.footerCli({}, {locale}), url: `/${lang}/home/platform/api-documentation/overview`},
      {text: m.footerSdk({}, {locale}), url: `/${lang}/sdk`},
      {text: m.footerIntegrations({}, {locale}), url: `/${lang}/home/guides`},
      {text: m.footerExtensions({}, {locale}), url: `/${lang}/sdk/media-react/examples`},
    ],
  };
}

function footerCommunitySection(locale: Locale): FooterSection {
  return {
    title: m.footerCommunity({}, {locale}),
    links: [
      {text: "X", url: "https://x.com/rixlcloud", external: true, Icon: XIcon},
      {text: "Discord", url: "https://discord.gg/...", external: true, Icon: DiscordIcon},
      {text: "YouTube", url: "https://youtube.com/@rixlcloud", external: true, Icon: YoutubeIcon},
      {text: "GitHub", url: "https://github.com/rixlhq", external: true, Icon: GithubIcon},
    ],
  };
}

export function FooterSections(lang: string): FooterSection[] {
  const locale = lang as Locale;
  return [
    footerResourcesSection(lang, locale),
    footerSupportSection(lang, locale),
    footerCompanySection(lang, locale),
    footerToolsSection(lang, locale),
    footerCommunitySection(locale),
  ];
}

export function FooterBottomLinks(lang: string): {text: string; url: string}[] {
  const locale = lang as Locale;
  return [
    {text: m.footerPrivacyPolicy({}, {locale}), url: `/${lang}/home/legal/privacy-policy`},
    {text: m.footerTermsOfService({}, {locale}), url: `/${lang}/home/legal/terms-of-service`},
    {text: m.footerCookiePolicy({}, {locale}), url: `/${lang}/home/legal/cookie-policy`},
  ];
}
