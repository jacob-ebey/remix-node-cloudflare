import { beforeAll, describe, expect, it, vi } from "vitest";
import { json, type EntryContext, type ServerBuild } from "#remix-server";

describe("service-worker", () => {
  let serviceWorkerFetch: (event: {
    respondWith: FetchEvent["respondWith"];
    request: Request;
  }) => void;

  const addEventListenerMock = vi.fn((event: string, cb: any) => {
    if (event === "fetch") {
      serviceWorkerFetch = cb;
    }
  });
  beforeAll(() => {
    global.addEventListener = addEventListenerMock;

    vi.mock("@remix-run/dev/server-build", () => mockServiceWorkerBuild);
    vi.mock("#remix-build/browser.mjs", () => mockBrowserBuild);
  });

  it("should register install and fetch listeners", async () => {
    await import("../index");
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);
    expect(addEventListenerMock).toHaveBeenCalledWith(
      "install",
      expect.anything()
    );
    expect(addEventListenerMock).toHaveBeenCalledWith(
      "fetch",
      expect.anything()
    );
  });

  it("should render common route on server", async () => {
    await import("../index");
    const respondWith = vi.fn();
    serviceWorkerFetch({
      respondWith,
      request: new Request("http://.../layout"),
    });
    expect(respondWith).toHaveBeenCalledTimes(0);
  });

  it("should render service-worker route nested in common route", async () => {
    await import("../index");
    const respondWith = vi.fn();
    serviceWorkerFetch({
      respondWith,
      request: new Request("http://.../layout/offline"),
    });
    expect(respondWith).toHaveBeenCalledTimes(1);
    const response: Response = await respondWith.mock.calls[0][0];
    expect(response.status).toBe(200);
    const remixContext: EntryContext = await response.json();
    const routePaths = remixContext.matches.map((m) => m.pathname);
    expect(routePaths).includes("/");
    expect(routePaths).includes("/layout");
    expect(routePaths).includes("/layout/offline");
  });
});

const mockBrowserBuild: ServerBuild = {
  assets: {
    version: "",
    url: "",
    entry: {
      module: "",
      imports: [],
    },
    routes: {},
  },
  assetsBuildDirectory: "",
  entry: {
    module: {
      default: (
        request: Request,
        responseStatusCode: number,
        responseHeaders: Headers,
        remixContext: EntryContext
      ) =>
        json(remixContext, {
          status: responseStatusCode,
          headers: responseHeaders,
        }),
    },
  },
  publicPath: "/build/",
  routes: {
    root: { id: "root", path: "", module: { default: () => null } },
    "routes/common/layout": {
      id: "routes/common/layout",
      parentId: "root",
      path: "layout",
      module: { default: () => null },
    },
    "routes/service-worker/layout.offline": {
      id: "routes/service-worker/layout.offline",
      parentId: "routes/common/layout",
      path: "offline",
      module: { default: () => null },
    },
    "routes/service-worker/offline": {
      id: "routes/service-worker/offline",
      parentId: "root",
      path: "offline",
      module: { default: () => null },
    },
    "routes/cloudflare/index": {
      id: "routes/cloudflare/index",
      parentId: "root",
      index: true,
      module: { default: () => null },
    },
    "routes/cloudflare/layout.child2": {
      id: "routes/cloudflare/layout.child2",
      parentId: "routes/common/layout",
      path: "child2",
      module: { default: () => null },
    },
    "routes/cloudflare/site[.]webmanifest": {
      id: "routes/cloudflare/site[.]webmanifest",
      parentId: "root",
      path: "site.webmanifest",
      module: { default: () => null },
    },
    "routes/node/counter": {
      id: "routes/node/counter",
      parentId: "root",
      path: "counter",
      module: { default: () => null },
    },
    "routes/node/layout.child": {
      id: "routes/node/layout.child",
      parentId: "routes/common/layout",
      path: "child",
      module: { default: () => null },
    },
  },
};

const mockServiceWorkerBuild: ServerBuild = {
  assets: {
    version: "",
    url: "",
    entry: {
      module: "",
      imports: [],
    },
    routes: {},
  },
  assetsBuildDirectory: "",
  entry: {
    module: {
      default: (
        request: Request,
        responseStatusCode: number,
        responseHeaders: Headers,
        remixContext: EntryContext
      ) =>
        json(remixContext, {
          status: responseStatusCode,
          headers: responseHeaders,
        }),
    },
  },
  publicPath: "/build/",
  routes: {
    root: { id: "root", path: "", module: { default: () => null } },
    "routes/service-worker/layout.offline": {
      id: "routes/service-worker/layout.offline",
      parentId: "root",
      path: "layout/offline",
      module: { default: () => null },
    },
    "routes/service-worker/offline": {
      id: "routes/service-worker/offline",
      parentId: "root",
      path: "offline",
      module: { default: () => null },
    },
  },
};
