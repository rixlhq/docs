"use client";
import {Laptop, Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {type HTMLAttributes, useSyncExternalStore} from "react";
import {m} from "@/paraglide/messages";
import {Button} from "@rixl/ui/button";

const subscribe = () => () => {};

export function ThemeToggle({
  className,
  mode = "light-dark",
  ...props
}: HTMLAttributes<HTMLElement> & {
  mode?: "light-dark" | "light-dark-system";
}) {
  const {setTheme, theme, resolvedTheme} = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const resolved = mounted ? resolvedTheme : "dark";
  const currentMode = mounted ? theme : "dark";

  const icon = (() => {
    if (mode === "light-dark-system" && currentMode === "system") return Laptop;
    return resolved === "dark" ? Moon : Sun;
  })();
  const Icon = icon;

  const nextTheme = () => {
    if (mode === "light-dark-system") {
      if (currentMode === "light") return "dark";
      if (currentMode === "dark") return "system";
      return "light";
    }

    return resolved === "light" ? "dark" : "light";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={m.toggleTheme()}
      onClick={() => setTheme(nextTheme())}
      data-theme-toggle=""
      type="button"
      {...props}
    >
      <Icon className="size-4.5" />
    </Button>
  );
}
