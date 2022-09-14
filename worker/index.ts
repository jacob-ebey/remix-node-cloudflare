import {
  getAssetFromKV,
  NotFoundError,
  MethodNotAllowedError,
  type CacheControl,
} from "@cloudflare/kv-asset-handler";
import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
import { createRoutes } from "@remix-run/server-runtime/dist/routes";
import { matchRoutes } from "react-router";

import { mergeBuilds } from "../lib/merge-builds.mjs";

// Virtual module provided by wrangler
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
// Remix build provided by remix build
import * as remixCloudflareBuild from "remix-build/cloudflare";
import * as remixBrowserBuild from "remix-build/browser.mjs";

const assetManifest = JSON.parse(manifestJSON);

const remixBuild = mergeBuilds(
  remixBrowserBuild,
  remixCloudflareBuild,
  "routes/node"
);
const requestHandler = createRequestHandler(remixBuild, process.env.NODE_ENV);

const cloudflareRoutes = createRoutes(
  remixBuild.routes as unknown as ServerBuild["routes"]
);

function cacheControl(request: Request): Partial<CacheControl> {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/build")) {
    // Cache build files for 1 year since they have a hash in their URL
    return {
      browserTTL: 60 * 60 * 24 * 365,
      edgeTTL: 60 * 60 * 24 * 365,
    };
  }

  // Cache everything else for 10 minutes
  return {
    browserTTL: 60 * 10,
    edgeTTL: 60 * 10,
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil(promise) {
            return ctx.waitUntil(promise);
          },
        },
        {
          cacheControl,
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof MethodNotAllowedError) {
        // fall through to the remix handler if not found
      } else {
        return new Response("An unexpected error occurred", { status: 500 });
      }
    }

    const url = new URL(request.url);

    try {
      const matches = matchRoutes(cloudflareRoutes as any, url.pathname);
      if (matches) {
        return await requestHandler(request, { env, ctx });
      }
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }

    const originUrl = new URL(env.ORIGIN_URL);
    originUrl.search = url.search;
    originUrl.pathname = url.pathname;
    originUrl.hash = url.hash;

    const originRequest = new Request(originUrl.href, request);
    const response = await fetch(originRequest);

    const originHeaders = new Headers(response.headers);
    originHeaders.set("X-Origin", originUrl.href);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: originHeaders,
    });
  },
};
