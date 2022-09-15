import * as path from "path";
import express from "express";
import compression from "compression";
import { createRequestHandler } from "@remix-run/express";

import { mergeBuilds } from "../lib/merge-builds.mjs";

const NODE_BUILD_PATH = path.join(process.cwd(), "build/node.mjs");
const BROWSER_BUILD_PATH = path.join(process.cwd(), "build/browser.mjs");

const app = express();

app.use(compression());

if (process.env.NODE_ENV === "development") {
  app.all("*", async (req, res, next) => {
    try {
      await createRequestHandler({
        build: await mergeBuilds(
          await import(`${BROWSER_BUILD_PATH}?${Date.now()}`),
          await import(`${NODE_BUILD_PATH}?${Date.now()}`),
          (e) =>
            e[0] === "root" ||
            e[0].startsWith("routes/node") ||
            e[0].startsWith("routes/common")
        ),
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
      build: await mergeBuilds(
        await import(`${BROWSER_BUILD_PATH}?${Date.now()}`),
        await import(`${NODE_BUILD_PATH}?${Date.now()}`),
        (e) =>
          e[0] === "root" ||
          e[0].startsWith("routes/node") ||
          e[0].startsWith("routes/common")
      ),
      mode: "production",
    })
  );
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
