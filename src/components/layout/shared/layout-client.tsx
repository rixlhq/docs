import {useParams} from "@tanstack/react-router";
import type {ReactElement, ReactNode} from "react";
import {cn} from "@/lib/cn";

export function Body({children}: {children: ReactNode}): ReactElement {
  const mode = useMode();

  return <body className={cn(mode, "relative flex min-h-screen flex-col")}>{children}</body>;
}

export function useMode(): string | undefined {
  const params = useParams({strict: false}) as Record<string, string | undefined>;
  const slug = params?.slug;
  return typeof slug === "string" && slug.includes("/") ? slug.split("/")[0] : slug;
}
