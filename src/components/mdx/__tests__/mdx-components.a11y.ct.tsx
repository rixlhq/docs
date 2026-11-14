import {createMemoryHistory, createRootRoute, createRouter, RouterProvider} from "@tanstack/react-router";
import type {ReactNode} from "react";
import {afterEach, describe, expect, test} from "vite-plus/test";
import {render} from "vitest-browser-react";
import {axeViolations, setTheme} from "../../../../test/a11y.ts";
import {Banner} from "../banner";
import {Callout} from "../callout";
import {Card} from "../card";
import {Columns} from "../columns";
import {Heading} from "../heading";

// Card renders internal links with TanStack's <Link>, which needs a router around it.
async function renderInRouter(ui: ReactNode): Promise<HTMLElement> {
  const router = createRouter({
    routeTree: createRootRoute({component: () => <main>{ui}</main>}),
    history: createMemoryHistory(),
  });
  await router.load();
  const screen = await render(<RouterProvider router={router} />);
  return screen.container;
}

afterEach(() => {
  setTheme("light");
});

test("the contrast check runs against the site CSS", async () => {
  const screen = await render(
    <main>
      <p className="text-gray-300">Too faint to read</p>
    </main>
  );

  expect(await axeViolations(screen.container)).toEqual([expect.stringMatching(/^color-contrast: /)]);
});

describe.each(["light", "dark"] as const)("%s theme", (theme) => {
  test.each(["info", "tip", "warning", "warn", "error"] as const)("Callout %s", async (type) => {
    setTheme(theme);
    const container = await renderInRouter(
      <Callout type={type} title="Before you start">
        <p>
          Read the <a href="/en/home">overview</a> and copy <code>RIXL_API_KEY</code>.
        </p>
      </Callout>
    );

    expect(await axeViolations(container)).toEqual([]);
  });

  test("Cards in Columns: internal, external, branded and plain", async () => {
    setTheme(theme);
    const container = await renderInRouter(
      <Columns cols={3}>
        <Card title="Video Component" href="/en/sdk/media-react/video" icon="video">
          Play a video.
        </Card>
        <Card title="GitHub" href="https://github.com" icon="react" brand="react">
          Source code.
        </Card>
        <Card title="General Support">Write to us.</Card>
      </Columns>
    );

    expect(await axeViolations(container)).toEqual([]);
  });

  test("Banner with its close button", async () => {
    setTheme(theme);
    const container = await renderInRouter(<Banner id="launch">New API version</Banner>);

    expect(await axeViolations(container)).toEqual([]);
  });

  test("Heading with its anchor and copy button", async () => {
    setTheme(theme);
    const container = await renderInRouter(
      <Heading as="h2" id="install">
        Install
      </Heading>
    );

    expect(await axeViolations(container)).toEqual([]);
  });
});
