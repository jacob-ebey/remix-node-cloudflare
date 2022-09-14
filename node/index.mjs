import * as path from "path";
import express from "express";
import compression from "compression";
import { createRequestHandler } from "@remix-run/express";

const NODE_BUILD_PATH = path.join(process.cwd(), "build/node.js");
const BROWSER_BUILD_PATH = path.join(process.cwd(), "build/browser.mjs");

const app = express();

app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.all("*", async (req, res, next) => {
    try {
      await createRequestHandler({
        build: await mergeBuilds(),
        mode: "development",
      })(req, res, next);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
} else {
  app.all(
    "*",
    createRequestHandler({
      build: await mergeBuilds(),
      mode: "production",
    })
  );
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

async function mergeBuilds() {
  const remixNodeBuild = await import(`${NODE_BUILD_PATH}?${Date.now()}`);
  const remixBrowserBuild = await import(`${BROWSER_BUILD_PATH}?${Date.now()}`);

  const routes = {
    ...remixBrowserBuild.routes,
    ...remixNodeBuild.routes,
  };

  return {
    ...remixNodeBuild,
    assets: remixBrowserBuild.assets,
    routes,
  };
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
