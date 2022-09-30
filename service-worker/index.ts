import {
  createRequestHandler,
  type ServerBuild,
} from "@remix-run/server-runtime";
import { createRoutes } from "@remix-run/server-runtime/dist/routes";
import { matchRoutes } from "react-router";

import * as remixServiceWorkerBuild from "@remix-run/dev/server-build";
import * as remixBrowserBuild from "#remix-build/browser.mjs";

import { mergeBuilds } from "../lib/merge-builds.mjs";

const sw = self as unknown as ServiceWorkerGlobalScope;

const remixBuild = mergeBuilds(
  remixBrowserBuild,
  remixServiceWorkerBuild,
  (e: string[]) =>
    e[0] === "root" ||
    e[0].startsWith("routes/service-worker") ||
    e[0].startsWith("routes/common")
);

const remixRequestHandler = createRequestHandler(
  remixBuild,
  process.env.NODE_ENV
);

const serviceWorkerRoutes = createRoutes(
  remixBuild.routes as unknown as ServerBuild["routes"]
);

sw.addEventListener("install", (event) => {
  sw.skipWaiting();
});

sw.addEventListener("activate", async () => {
  await sw.clients.claim();
});

sw.addEventListener("fetch", ((event: FetchEvent) => {
  const url = new URL(event.request.url);
  const matches = matchRoutes(serviceWorkerRoutes as any, url.pathname);

  if (
    matches &&
    matches.length > 1 &&
    matches.slice(-1)[0].route.id?.startsWith("routes/service-worker/")
  ) {
    event.respondWith(remixRequestHandler(event.request));
  }
}) as any);

export {};
