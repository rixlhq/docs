import {createMemoryHistory, createRootRoute, createRouter, RouterProvider} from "@tanstack/react-router";
import type {ReactNode} from "react";
import {TanstackProvider} from "fumadocs-core/framework/tanstack";
import {afterEach, describe, expect, test} from "vite-plus/test";
import {render} from "vitest-browser-react";
import {SearchDialog, SearchDialogHeader} from "fumadocs-ui/components/dialog/search";
import {setTheme, axeViolations} from "../../../test/a11y.ts";
import {SearchInput} from "../search-input";

async function renderCombobox(children: ReactNode): Promise<Awaited<ReturnType<typeof render>>> {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <main>
          <TanstackProvider>{children}</TanstackProvider>
        </main>
      ),
    }),
    history: createMemoryHistory(),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  setTheme("light");
});

describe.each(["light", "dark"] as const)("%s theme", (theme) => {
  test("query field is a combobox wired to the result list", async () => {
    setTheme(theme);
    const screen = await renderCombobox(
      <SearchDialog open onOpenChange={() => {}} search="" onSearchChange={() => {}}>
        <SearchDialogHeader>
          <SearchInput />
        </SearchDialogHeader>
      </SearchDialog>
    );

    const box = screen.getByRole("combobox");
    await expect(box).toBeVisible();
    await expect(box).toHaveAttribute("aria-controls", "fd-search-list");
    expect(await axeViolations(screen.container)).toEqual([]);
  });
});
