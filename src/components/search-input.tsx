"use client";

import {useSyncExternalStore} from "react";
import {useSearch} from "fumadocs-ui/components/dialog/search";
import {m} from "@/paraglide/messages";

/**
 * The command-palette query field. This is intentionally a native input,
 * not @rixl/ui Input: it is a combobox wired to the result listbox
 * (`aria-expanded` / `aria-activedescendant` / `aria-controls`, the
 * upstream fumadocs pattern), and the borderless large-type palette look
 * is not a Rixl text field. Wrapping Input only produced overrides that
 * stripped it down to this anyway, while dropping the listbox wiring.
 */
export function SearchInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "role">) {
  const {search, onSearchChange, getActive, subscribeActive} = useSearch();
  const active = useSyncExternalStore(subscribeActive, getActive, getActive);

  return (
    <input
      {...props}
      role="combobox"
      aria-expanded={active !== null}
      aria-activedescendant={active === null ? undefined : `fd-search-option-${active}`}
      aria-autocomplete="list"
      aria-controls="fd-search-list"
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder={m.search()}
      aria-label={m.search()}
      className="w-0 flex-1 border-0 bg-transparent text-lg placeholder:text-fd-muted-foreground focus-visible:outline-none"
    />
  );
}
