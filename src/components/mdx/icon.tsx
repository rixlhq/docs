import type {LucideProps} from "lucide-react";
import {cloneElement, type ComponentProps, type ReactElement} from "react";
import {iconMap, type IconName} from "@/generated/icons";
import {cn} from "cnfast";

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

  const IconComponent = name ? iconMap[name] : null;
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
