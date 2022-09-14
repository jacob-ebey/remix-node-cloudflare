import flatRoutes from "remix-flat-routes";

if (!process.env.BUILD_FOR) {
  throw new Error("BUILD_FOR must be set");
}

let serverBuildPath = "build/cloudflare.js";
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
    break;
  case "browser":
    serverBuildPath = "build/browser.mjs";
    serverModuleFormat = "esm";
    assetsBuildDirectory = "public/build";
    break;
}

/** @type {import("@remix-run/dev").AppConfig} */
export default {
  serverBuildPath,
  serverModuleFormat,
  assetsBuildDirectory,
  devServerPort,
  ignoredRouteFiles: ["**/*"],
  devServerBroadcastDelay: 1000,
  routes: async (defineRoutes) => {
    if (process.env.BUILD_FOR === "browser") {
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

function findParentRouteId(routeIds, childRouteId) {
  childRouteId = platformAgnosticId(childRouteId);
  return routeIds.find(
    (id) =>
      platformAgnosticId(id) !== childRouteId &&
      childRouteId.startsWith(platformAgnosticId(id))
  );
}

function platformAgnosticId(id) {
  return id.replace(/^routes\/(cloudflare|node|common)\//, "routes/");
}
