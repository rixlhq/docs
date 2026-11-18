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
} from "fumadocs-ui/components/dialog/search";
import {useI18n} from "fumadocs-ui/contexts/i18n";
import {m} from "@/paraglide/messages";
import {SearchInput} from "./search-input";

function initDB(locale?: string) {
  return create({
    schema: {_: "string"},
    // https://github.com/micheleriva/zbsearch — same language names as Orama
    language: locale === "de" ? "german" : "english",
  });
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
