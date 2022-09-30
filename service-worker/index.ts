import {
  createRequestHandler,
  type ServerBuild,
} from "@remix-run/server-runtime";
import { createRoutes } from "@remix-run/server-runtime/dist/routes";
import { matchRoutes } from "react-router";

import * as remixServiceWorkerBuild from "@remix-run/dev/server-build";
import * as remixBrowserBuild from "#remix-build/browser.mjs";

import { mergeBuilds } from "../lib/merge-builds.mjs";

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

let sw = self as unknown as ServiceWorkerGlobalScope;
let skipPromise: Promise<void> | null = null;
sw.addEventListener("install", () => {
  skipPromise = sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  sw = self as unknown as ServiceWorkerGlobalScope;
  event.waitUntil(Promise.resolve(skipPromise));
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", ((event: FetchEvent) => {
  const url = new URL(event.request.url);
  const matches = matchRoutes(serviceWorkerRoutes as any, url.pathname);

  if (
    matches &&
    matches.length > 1 &&
    matches.slice(-1)[0].route.id?.startsWith("routes/service-worker/")
  ) {
    let timeoutPromiseForSafariWorkaroundBecauseIDoNotKnowWhatIAmDoingInServiceWorkers =
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
    event.respondWith(
      Promise.race([
        timeoutPromiseForSafariWorkaroundBecauseIDoNotKnowWhatIAmDoingInServiceWorkers,
        remixRequestHandler(event.request.clone()),
      ]).then((response) => {
        if (!response) {
          return fetch(event.request);
        }
        return response;
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
}) as any);

export {};
