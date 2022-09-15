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
  remixServiceWorkerBuild.routes as unknown as ServerBuild["routes"]
);

async function handleRequest(event: FetchEvent) {
  const request = event.request;

  try {
    return await remixRequestHandler(request.clone());
  } catch (error) {
    console.error(error);
  }

  return fetch(request);
}

self.addEventListener("install", () => {
  (self as any).skipWaiting();
});

self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const matches = matchRoutes(serviceWorkerRoutes as any, url.pathname);
  if (matches && matches.length > 1) {
    event.respondWith(handleRequest(event));
  } else {
    return;
  }
});

export {};
