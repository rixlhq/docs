import {FooterContentSectionLink, type FooterSectionLinkProps} from "./footer-content-section-link";

export interface FooterSection {
  title: string;
  links: FooterSectionLinkProps[];
}

export function FooterContentSection({title, links}: FooterSection) {
  return (
    <div>
      <h3 className="font-medium text-xs text-fd-muted-foreground mb-3 uppercase tracking-wide">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <FooterContentSectionLink key={link.url} text={link.text} url={link.url} external={link.external} Icon={link.Icon} />
        ))}
      </ul>
    </div>
  );
}
