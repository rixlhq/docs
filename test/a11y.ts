import axe from "axe-core";

// WCAG 2.2 A and AA, the level the European Accessibility Act and most procurement rules require.
const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Runs axe on `element` and returns one line per violating node, so a failing
 * `toEqual([])` shows which rule broke on which element.
 */
export async function axeViolations(element: Element): Promise<string[]> {
  const {violations} = await axe.run(element, {runOnly: {type: "tag", values: WCAG_AA}});
  return violations.flatMap((violation) => violation.nodes.map((node) => `${violation.id}: ${node.target.join(" > ")}`));
}

/** Switches the page between the light and dark theme, the way next-themes does on the site. */
export function setTheme(theme: "light" | "dark"): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
