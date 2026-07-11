import {useParams} from "@tanstack/react-router";
import type {ReactElement, ReactNode} from "react";
import {cn} from "@/lib/cn";

export function Body({children}: {children: ReactNode}): ReactElement {
  const mode = useMode();

  return <body className={cn(mode, "relative flex min-h-screen flex-col")}>{children}</body>;
}

export function useMode(): string | undefined {
  const params = useParams({strict: false});
  const splat = params?._splat;
  return typeof splat === "string" && splat.includes("/") ? splat.split("/")[0] : splat;
}
