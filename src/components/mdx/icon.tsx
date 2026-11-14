import type {LucideProps} from "lucide-react";
import {cloneElement, type ComponentProps, type ReactElement} from "react";
import {iconMap, type IconName} from "@/generated/icons";
import {
  AngularIcon,
  AstroIcon,
  CoreIcon,
  CsharpIcon,
  GoIcon,
  JavaIcon,
  JavaScriptIcon,
  LitIcon,
  PhpIcon,
  PythonIcon,
  ReactIcon,
  RubyIcon,
  RustIcon,
  SvelteIcon,
  TerraformIcon,
  TypeScriptIcon,
  UiIcon,
  VueIcon,
} from "@/components/icons/framework-icons";
import {cn} from "cn";

type FrameworkIconName =
  | "react"
  | "vue"
  | "svelte"
  | "angular"
  | "astro"
  | "lit"
  | "core"
  | "ui"
  | "go"
  | "python"
  | "java"
  | "csharp"
  | "rust"
  | "terraform"
  | "php"
  | "ruby"
  | "typescript"
  | "javascript"
  | "node"
  | "ts"
  | "js";

const FRAMEWORK_ICON_MAP: Record<FrameworkIconName, (props: ComponentProps<"svg">) => ReactElement> = {
  react: ReactIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  angular: AngularIcon,
  astro: AstroIcon,
  lit: LitIcon,
  core: CoreIcon,
  ui: UiIcon,
  go: GoIcon,
  python: PythonIcon,
  java: JavaIcon,
  csharp: CsharpIcon,
  rust: RustIcon,
  terraform: TerraformIcon,
  php: PhpIcon,
  ruby: RubyIcon,
  typescript: TypeScriptIcon,
  javascript: JavaScriptIcon,
  node: TypeScriptIcon,
  ts: TypeScriptIcon,
  js: JavaScriptIcon,
};

type IconProps = Omit<LucideProps, "name"> &
  (
    | {
        name: IconName;
        icon?: never;
      }
    | {
        name?: never;
        icon: ReactElement;
      }
  );

export type {IconName};

export const Icon = ({name, icon, ...props}: IconProps) => {
  if (icon) return cloneElement(icon, props);

  if (name && name in FRAMEWORK_ICON_MAP) {
    const FrameworkComponent = FRAMEWORK_ICON_MAP[name as FrameworkIconName];
    return <FrameworkComponent {...props} />;
  }

  const IconComponent = name && name in iconMap ? iconMap[name as IconName] : null;
  if (!IconComponent) return <SVGIcon {...props} />;

  return <IconComponent {...props} />;
};

const SVGIcon = (props: ComponentProps<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className={cn("lucide", props.className)}
      {...props}
    />
  );
};
