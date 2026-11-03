import type {LucideProps} from "lucide-react";
import {cloneElement, type ComponentProps, type ReactElement} from "react";
import {iconMap, type IconName} from "@/generated/icons";
import {AngularIcon, CoreIcon, LitIcon, ReactIcon, SvelteIcon, UiIcon, VueIcon} from "@/components/icons/framework-icons";
import {cn} from "cn";

export type FrameworkIconName = "react" | "vue" | "svelte" | "angular" | "lit" | "core" | "ui";

const FRAMEWORK_ICON_MAP: Record<string, (props: ComponentProps<"svg">) => ReactElement> = {
  react: ReactIcon,
  vue: VueIcon,
  svelte: SvelteIcon,
  angular: AngularIcon,
  lit: LitIcon,
  core: CoreIcon,
  ui: UiIcon,
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
