import flatRoutes from "remix-flat-routes";

if (!process.env.BUILD_FOR) {
  throw new Error("BUILD_FOR must be set");
}

let serverBuildPath = "build/cloudflare.js";
let serverBuildTarget = "cloudflare-workers";
let assetsBuildDirectory = ".cache/build";
let serverModuleFormat = undefined;
let devServerPort = 8002;
switch (process.env.BUILD_FOR) {
  case "cloudflare":
    devServerPort = 8003;
    break;
  case "node":
    devServerPort = 8004;
    serverBuildPath = "build/node.js";
    serverBuildTarget = "node";
    break;
  case "browser":
    serverBuildPath = "build/browser.mjs";
    serverBuildTarget = undefined;
    serverModuleFormat = "esm";
    assetsBuildDirectory = "public/build";
    break;
}

/** @type {import("@remix-run/dev").AppConfig} */
export default {
  serverBuildPath,
  serverBuildTarget,
  serverModuleFormat,
  assetsBuildDirectory,
  devServerPort,
  ignoredRouteFiles: ["**/*"],
  devServerBroadcastDelay: 1000,
  routes: async (defineRoutes) => {
    if (process.env.BUILD_FOR === "browser") {
      return {
        ...flatRoutes.flatRoutes(`routes/cloudflare`, defineRoutes),
        ...flatRoutes.flatRoutes(`routes/node`, defineRoutes),
      };
    }
    return flatRoutes.flatRoutes(
      `routes/${process.env.BUILD_FOR}`,
      defineRoutes
    );
  },
};
