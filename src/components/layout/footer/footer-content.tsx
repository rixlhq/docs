import {useMemo} from "react";
import {cn} from "cnfast";
import {FooterSections} from "@/lib/layout.shared";
import {FooterContentSection} from "./footer-content-section";

export function FooterContent({lang}: {lang: string}) {
  const sections = useMemo(() => FooterSections(lang), [lang]);
  return (
    <div
      className={cn("max-w-screen-xl w-full px-10 mx-auto", "grid grid-cols-2 lg:grid-cols-5", "gap-6 md:gap-8", "lg:justify-items-center")}
    >
      {sections.map((section) => (
        <FooterContentSection key={section.title} title={section.title} links={section.links} />
      ))}
    </div>
  );
}
