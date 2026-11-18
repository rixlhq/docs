import {expect, test} from "vite-plus/test";
import {render} from "vitest-browser-react";
import {FullSearchTrigger} from "../search-trigger";

test("full search trigger is navbar chrome, not a design-system button", async () => {
  const screen = await render(<FullSearchTrigger />);

  expect(screen.container.querySelector("button[data-search-full]")).not.toBeNull();
  expect(screen.container.querySelector('[data-slot="button"]')).toBeNull();
});
