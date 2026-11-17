import {useEffect, useRef} from "react";

function clearStaleApiRails(): void {
  for (const stale of Array.from(document.querySelectorAll<HTMLElement>(".api-toc-rail"))) {
    stale.classList.remove("api-toc-rail");
    stale.remove();
  }
}

function restoreTocVisibility(): void {
  const toc = document.getElementById("nd-toc");
  if (!toc) return;

  delete toc.dataset.apiRail;
  for (const child of Array.from(toc.children)) {
    if (child instanceof HTMLElement) {
      child.style.removeProperty("display");
    }
  }
}

function setExpandedState(button: HTMLButtonElement, expanded: boolean): void {
  const panelId = button.getAttribute("aria-controls");
  if (!panelId) return;

  const panel = document.getElementById(panelId);
  if (!panel) return;

  button.setAttribute("aria-expanded", expanded ? "true" : "false");
  button.setAttribute("data-state", expanded ? "open" : "closed");

  const item = button.closest<HTMLElement>("[data-state]");
  item?.setAttribute("data-state", expanded ? "open" : "closed");

  panel.setAttribute("data-state", expanded ? "open" : "closed");
  if (expanded) panel.removeAttribute("hidden");
  else panel.setAttribute("hidden", "");
}

function setTabSelected(tab: HTMLButtonElement, selected: boolean, panel: HTMLElement | null): void {
  tab.setAttribute("aria-selected", selected ? "true" : "false");
  tab.setAttribute("data-state", selected ? "active" : "inactive");
  // `@rixl/ui` tabs style the active trigger via `data-active`; the
  // server-rendered API HTML has no React tree, so mirror it here.
  if (selected) tab.setAttribute("data-active", "");
  else tab.removeAttribute("data-active");
  tab.tabIndex = selected ? 0 : -1;

  if (!panel) return;
  panel.setAttribute("data-state", selected ? "active" : "inactive");
  if (selected) panel.removeAttribute("hidden");
  else panel.setAttribute("hidden", "");
}

function activateTab(button: HTMLButtonElement): void {
  const tabList = button.closest<HTMLElement>('[role="tablist"]');
  if (!tabList) return;

  const tabs = tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  for (const tab of tabs) {
    const panelId = tab.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    setTabSelected(tab, tab === button, panel);
  }
}

function createApiClickHandler(root: HTMLElement) {
  return (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("button");
    if (!button) return;
    if (!root.contains(button)) return;

    if (button.getAttribute("role") === "tab") {
      event.preventDefault();
      activateTab(button);
      return;
    }

    if (!button.hasAttribute("aria-controls") || !button.hasAttribute("aria-expanded") || button.hasAttribute("aria-haspopup")) {
      return;
    }

    event.preventDefault();
    const expanded = button.getAttribute("aria-expanded") === "true";
    setExpandedState(button, !expanded);
  };
}

function setupApiInteractions(root: HTMLElement) {
  clearStaleApiRails();
  restoreTocVisibility();

  const onClick = createApiClickHandler(root);
  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
  };
}

export function StaticApiHtml({html}: {html: string}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    return setupApiInteractions(root);
  }, [html]);

  return <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{__html: html}} />;
}
