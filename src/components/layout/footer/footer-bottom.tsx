import {useMemo} from "react";
import {FooterBottomLinks} from "@/lib/layout.shared";
import {FooterBottomLink} from "./footer-bottom-link";
import {m} from "@/paraglide/messages";
import {locales} from "@/paraglide/runtime";

type Locale = (typeof locales)[number];

const CURRENT_YEAR = new Date().getFullYear();

export function FooterBottom({lang}: {lang: string}) {
  const links = useMemo(() => FooterBottomLinks(lang), [lang]);

  return (
    <div className="flex flex-wrap justify-center space-x-2 text-xs text-fd-muted-foreground">
      <span>{m.footerCopyright({year: CURRENT_YEAR}, {locale: lang as Locale})}</span>
      {links.map((link) => (
        <div key={link.text} className="space-x-2">
          <span>•</span>
          <FooterBottomLink url={link.url} text={link.text} />
        </div>
      ))}
    </div>
  );
}
