import type {IconName} from "@/components/mdx/icon";

export interface BrandTheme {
  badge: string;
  cardHoverBorder: string;
  cardHoverShadow: string;
  titleHover: string;
  arrowHover: string;
}

export const BRAND_THEMES: Record<string, BrandTheme> = {
  react: {
    badge: "border-[#00D8FE]/30 bg-[#00D8FE]/10 shadow-[#00D8FE]/10 dark:border-[#00D8FE]/30 dark:bg-[#00D8FE]/15",
    cardHoverBorder: "hover:border-[#00D8FE]/50",
    cardHoverShadow: "hover:shadow-[#00D8FE]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  vue: {
    badge: "border-[#42B883]/30 bg-[#42B883]/10 shadow-[#42B883]/10 dark:border-[#42B883]/30 dark:bg-[#42B883]/15",
    cardHoverBorder: "hover:border-[#42B883]/50",
    cardHoverShadow: "hover:shadow-[#42B883]/10",
    titleHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
    arrowHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
  },
  svelte: {
    badge: "border-[#FF3E00]/30 bg-[#FF3E00]/10 shadow-[#FF3E00]/10 dark:border-[#FF3E00]/30 dark:bg-[#FF3E00]/15",
    cardHoverBorder: "hover:border-[#FF3E00]/50",
    cardHoverShadow: "hover:shadow-[#FF3E00]/10",
    titleHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
    arrowHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
  },
  angular: {
    badge: "border-[#DD0031]/30 bg-[#DD0031]/10 shadow-[#DD0031]/10 dark:border-[#DD0031]/30 dark:bg-[#DD0031]/15",
    cardHoverBorder: "hover:border-[#DD0031]/50",
    cardHoverShadow: "hover:shadow-[#DD0031]/10",
    titleHover: "group-hover:text-[#dc2626] dark:group-hover:text-[#f87171]",
    arrowHover: "group-hover:text-[#dc2626] dark:group-hover:text-[#f87171]",
  },
  astro: {
    badge: "border-[#FF5D01]/30 bg-[#FF5D01]/10 shadow-[#FF5D01]/10 dark:border-[#FF5D01]/30 dark:bg-[#FF5D01]/15",
    cardHoverBorder: "hover:border-[#FF5D01]/50",
    cardHoverShadow: "hover:shadow-[#FF5D01]/10",
    titleHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
    arrowHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
  },
  lit: {
    badge: "border-[#324FFF]/30 bg-[#324FFF]/10 shadow-[#324FFF]/10 dark:border-[#324FFF]/30 dark:bg-[#324FFF]/15",
    cardHoverBorder: "hover:border-[#324FFF]/50",
    cardHoverShadow: "hover:shadow-[#324FFF]/10",
    titleHover: "group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa]",
    arrowHover: "group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa]",
  },
  core: {
    badge: "border-[#3178C6]/30 bg-[#3178C6]/10 shadow-[#3178C6]/10 dark:border-[#3178C6]/30 dark:bg-[#3178C6]/15",
    cardHoverBorder: "hover:border-[#3178C6]/50",
    cardHoverShadow: "hover:shadow-[#3178C6]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  ui: {
    badge: "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 shadow-[#8B5CF6]/10 dark:border-[#8B5CF6]/30 dark:bg-[#8B5CF6]/15",
    cardHoverBorder: "hover:border-[#8B5CF6]/50",
    cardHoverShadow: "hover:shadow-[#8B5CF6]/10",
    titleHover: "group-hover:text-[#7c3aed] dark:group-hover:text-[#a78bfa]",
    arrowHover: "group-hover:text-[#7c3aed] dark:group-hover:text-[#a78bfa]",
  },
  go: {
    badge: "border-[#00ADD8]/30 bg-[#00ADD8]/10 shadow-[#00ADD8]/10 dark:border-[#00ADD8]/30 dark:bg-[#00ADD8]/15",
    cardHoverBorder: "hover:border-[#00ADD8]/50",
    cardHoverShadow: "hover:shadow-[#00ADD8]/10",
    titleHover: "group-hover:text-[#00ADD8] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#00ADD8] dark:group-hover:text-[#38bdf8]",
  },
  python: {
    badge: "border-[#3776AB]/30 bg-[#3776AB]/10 shadow-[#3776AB]/10 dark:border-[#3776AB]/30 dark:bg-[#3776AB]/15",
    cardHoverBorder: "hover:border-[#3776AB]/50",
    cardHoverShadow: "hover:shadow-[#3776AB]/10",
    titleHover: "group-hover:text-[#3776AB] dark:group-hover:text-[#60a5fa]",
    arrowHover: "group-hover:text-[#3776AB] dark:group-hover:text-[#60a5fa]",
  },
  java: {
    badge: "border-[#EA2D2E]/30 bg-[#EA2D2E]/10 shadow-[#EA2D2E]/10 dark:border-[#EA2D2E]/30 dark:bg-[#EA2D2E]/15",
    cardHoverBorder: "hover:border-[#EA2D2E]/50",
    cardHoverShadow: "hover:shadow-[#EA2D2E]/10",
    titleHover: "group-hover:text-[#EA2D2E] dark:group-hover:text-[#f87171]",
    arrowHover: "group-hover:text-[#EA2D2E] dark:group-hover:text-[#f87171]",
  },
  csharp: {
    badge: "border-[#68217A]/30 bg-[#68217A]/10 shadow-[#68217A]/10 dark:border-[#68217A]/30 dark:bg-[#68217A]/15",
    cardHoverBorder: "hover:border-[#68217A]/50",
    cardHoverShadow: "hover:shadow-[#68217A]/10",
    titleHover: "group-hover:text-[#68217A] dark:group-hover:text-[#c084fc]",
    arrowHover: "group-hover:text-[#68217A] dark:group-hover:text-[#c084fc]",
  },
  rust: {
    badge: "border-[#DEA584]/30 bg-[#DEA584]/10 shadow-[#DEA584]/10 dark:border-[#DEA584]/30 dark:bg-[#DEA584]/15",
    cardHoverBorder: "hover:border-[#DEA584]/50",
    cardHoverShadow: "hover:shadow-[#DEA584]/10",
    titleHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
    arrowHover: "group-hover:text-[#ea580c] dark:group-hover:text-[#fb923c]",
  },
  terraform: {
    badge: "border-[#844FBA]/30 bg-[#844FBA]/10 shadow-[#844FBA]/10 dark:border-[#844FBA]/30 dark:bg-[#844FBA]/15",
    cardHoverBorder: "hover:border-[#844FBA]/50",
    cardHoverShadow: "hover:shadow-[#844FBA]/10",
    titleHover: "group-hover:text-[#844FBA] dark:group-hover:text-[#a855f7]",
    arrowHover: "group-hover:text-[#844FBA] dark:group-hover:text-[#a855f7]",
  },
  php: {
    badge: "border-[#777BB4]/30 bg-[#777BB4]/10 shadow-[#777BB4]/10 dark:border-[#777BB4]/30 dark:bg-[#777BB4]/15",
    cardHoverBorder: "hover:border-[#777BB4]/50",
    cardHoverShadow: "hover:shadow-[#777BB4]/10",
    titleHover: "group-hover:text-[#777BB4] dark:group-hover:text-[#818cf8]",
    arrowHover: "group-hover:text-[#777BB4] dark:group-hover:text-[#818cf8]",
  },
  ruby: {
    badge: "border-[#CC342D]/30 bg-[#CC342D]/10 shadow-[#CC342D]/10 dark:border-[#CC342D]/30 dark:bg-[#CC342D]/15",
    cardHoverBorder: "hover:border-[#CC342D]/50",
    cardHoverShadow: "hover:shadow-[#CC342D]/10",
    titleHover: "group-hover:text-[#CC342D] dark:group-hover:text-[#f87171]",
    arrowHover: "group-hover:text-[#CC342D] dark:group-hover:text-[#f87171]",
  },
  typescript: {
    badge: "border-[#3178C6]/30 bg-[#3178C6]/10 shadow-[#3178C6]/10 dark:border-[#3178C6]/30 dark:bg-[#3178C6]/15",
    cardHoverBorder: "hover:border-[#3178C6]/50",
    cardHoverShadow: "hover:shadow-[#3178C6]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  ts: {
    badge: "border-[#3178C6]/30 bg-[#3178C6]/10 shadow-[#3178C6]/10 dark:border-[#3178C6]/30 dark:bg-[#3178C6]/15",
    cardHoverBorder: "hover:border-[#3178C6]/50",
    cardHoverShadow: "hover:shadow-[#3178C6]/10",
    titleHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
    arrowHover: "group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8]",
  },
  javascript: {
    badge: "border-[#F7DF1E]/30 bg-[#F7DF1E]/10 shadow-[#F7DF1E]/10 dark:border-[#F7DF1E]/30 dark:bg-[#F7DF1E]/15",
    cardHoverBorder: "hover:border-[#F7DF1E]/50",
    cardHoverShadow: "hover:shadow-[#F7DF1E]/10",
    titleHover: "group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15]",
    arrowHover: "group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15]",
  },
  js: {
    badge: "border-[#F7DF1E]/30 bg-[#F7DF1E]/10 shadow-[#F7DF1E]/10 dark:border-[#F7DF1E]/30 dark:bg-[#F7DF1E]/15",
    cardHoverBorder: "hover:border-[#F7DF1E]/50",
    cardHoverShadow: "hover:shadow-[#F7DF1E]/10",
    titleHover: "group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15]",
    arrowHover: "group-hover:text-[#ca8a04] dark:group-hover:text-[#facc15]",
  },
  node: {
    badge: "border-[#5FA04E]/30 bg-[#5FA04E]/10 shadow-[#5FA04E]/10 dark:border-[#5FA04E]/30 dark:bg-[#5FA04E]/15",
    cardHoverBorder: "hover:border-[#5FA04E]/50",
    cardHoverShadow: "hover:shadow-[#5FA04E]/10",
    titleHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
    arrowHover: "group-hover:text-[#16a34a] dark:group-hover:text-[#4ade80]",
  },
};

export function getBrandTheme(brand?: string, icon?: IconName): BrandTheme | undefined {
  if (brand && brand in BRAND_THEMES) return BRAND_THEMES[brand];
  if (typeof icon === "string" && icon in BRAND_THEMES) return BRAND_THEMES[icon];
  return undefined;
}
