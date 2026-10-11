"use client";
import {create} from "zbsearch";
import {useDocsSearch} from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
  useSearch,
} from "fumadocs-ui/components/dialog/search";
import {useI18n} from "fumadocs-ui/contexts/i18n";
import {m} from "@/paraglide/messages";

function initDB(locale?: string) {
  return create({
    schema: {_: "string"},
    // https://github.com/micheleriva/zbsearch — same language names as Orama
    language: locale === "de" ? "german" : "english",
  });
}

/**
 * Local replacement for `SearchDialogInput` from fumadocs. The upstream
 * component hard-codes its `placeholder` from `useTranslations`, and the
 * spread order in the source means passing `placeholder` as a prop cannot
 * override it. Re-implementing the input here lets us source the
 * placeholder from paraglide.
 */
function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const {search, onSearchChange} = useSearch();
  return (
    <input
      {...props}
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder={m.search()}
      className="w-0 flex-1 bg-transparent text-lg placeholder:text-fd-muted-foreground focus-visible:outline-none"
    />
  );
}

function SearchEmpty() {
  return <div className="py-12 text-center text-sm text-fd-muted-foreground">{m.searchNoResult()}</div>;
}

export default function DefaultSearchDialog(props: SharedProps) {
  const {locale} = useI18n(); // (optional) for i18n
  const {search, setSearch, query} = useDocsSearch({
    type: "static",
    from: `/api/search/${locale}`,
    initDB: () => initDB(locale),
    locale,
  });

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchInput />
          <SearchDialogClose aria-label={m.closeSearch()} />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} Empty={SearchEmpty} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
