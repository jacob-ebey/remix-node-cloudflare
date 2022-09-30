import flatRoutes from "remix-flat-routes";

import { findParentRouteId } from "./lib/merge-builds.mjs";

if (!process.env.BUILD_FOR) {
  throw new Error("BUILD_FOR must be set");
}

let server;
let serverBuildPath;
let assetsBuildDirectory = ".cache/build/" + process.env.BUILD_FOR;
let serverDependenciesToBundle;
let serverBuildTarget;
let serverModuleFormat = "esm";
let devServerPort = 8002;
let watchPaths;
switch (process.env.BUILD_FOR) {
  case "node":
    devServerPort = 8003;
    serverBuildPath = "build/node.mjs";
    break;
  case "cloudflare":
    devServerPort = 8004;
    serverBuildPath = "build/cloudflare.mjs";
    break;
  case "service-worker":
    serverBuildTarget = "cloudflare-workers";
    serverDependenciesToBundle = [/.*/];
    devServerPort = 8005;
    serverBuildPath = "public/sw.js";
    server = "service-worker/index.ts";
    watchPaths = ["build/browser.mjs"];
    break;
  case "browser":
    serverBuildPath = "build/browser.mjs";
    assetsBuildDirectory = "public/build";
    break;
  default:
    throw new Error(`Unknown BUILD_FOR: ${process.env.BUILD_FOR}`);
}

/** @type {import("@remix-run/dev").AppConfig} */
export default {
  server,
  serverBuildPath,
  serverModuleFormat,
  serverBuildTarget,
  assetsBuildDirectory,
  serverDependenciesToBundle,
  watchPaths,
  devServerPort,
  ignoredRouteFiles: ["**/*"],
  devServerBroadcastDelay: 1000,
  routes: async (defineRoutes) => {
    if (
      process.env.BUILD_FOR === "browser" ||
      process.env.BUILD_FOR === "node-browser"
    ) {
      return allRoutes(defineRoutes);
    }

    return flatRoutes.flatRoutes(
      `routes/${process.env.BUILD_FOR}`,
      defineRoutes
    );
  },
};

function allRoutes(defineRoutes) {
  const routes = {
    ...flatRoutes.flatRoutes(`routes/common`, defineRoutes),
    ...flatRoutes.flatRoutes(`routes/service-worker`, defineRoutes),
    ...flatRoutes.flatRoutes(`routes/cloudflare`, defineRoutes),
    ...flatRoutes.flatRoutes(`routes/node`, defineRoutes),
  };

  const routeIds = Object.keys(routes).sort((a, b) => b.length - a.length);

  for (const routeId of routeIds) {
    const parentId = findParentRouteId(routeIds, routeId);
    if (parentId) {
      routes[routeId].parentId = parentId;
      routes[routeId].path = routes[routeId].path.replace(
        new RegExp(`^${routes[parentId].path}/`),
        ""
      );
    }
  }

  return routes;
}
