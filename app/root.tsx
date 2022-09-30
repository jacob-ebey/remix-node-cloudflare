import { type ReactNode } from "react";
import { type LinksFunction, type MetaFunction } from "#remix-server";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useHref,
  useLocation,
} from "@remix-run/react";
import useServiceWorker from "#use-service-worker";

import { useIsServiceWorkerRoute } from "./utils";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/@exampledev/new.css@1.1.3/new.css",
  },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Examples",
  viewport: "width=device-width,initial-scale=1",
});

function Document({ children }: { children: ReactNode }) {
  const serviceWorker = useServiceWorker();
  const location = useLocation();
  const href = useHref(location);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <header>
          {serviceWorker.serviceWorkerStatus === "updates" && (
            <p>
              An app update is avaliable. <a href={href}>Reload the page.</a>
            </p>
          )}
          <h1>remix-node-cloudflare-serviceworker</h1>
          <nav>
            <Link to="/">Home</Link> / <Link to="/layout">Layout</Link>
            {" / "}
            <Link to="layout/node">Node</Link>
            {" / "}
            <Link to="layout/cf">Cloudflare</Link>
            {" / "}
            <Link to="layout/offline">Service Worker</Link>
            {" / "}
            <Link to="counter">PostgreSQL Counter</Link>
            {" / "}
            <Link to="notes">Offline Notes</Link>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

function ServiceWorkerWarnring() {
  const serviceWorker = useServiceWorker();
  const location = useLocation();
  const href = useHref(location);

  console.log(serviceWorker);

  const isServiceWorkerRoute = useIsServiceWorkerRoute();

  return !isServiceWorkerRoute ? null : serviceWorker.serviceWorkerStatus ===
    "error" ? (
    <p>Your browser does not support service workers. Try another browser.</p>
  ) : (
    <p>
      Looks like this is your first visit or your application is out of date.
      Try <a href={href}>reloading the page.</a>
    </p>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document>
      <h1>Oops</h1>
      <p>Something went wrong</p>
      <ServiceWorkerWarnring />
    </Document>
  );
}

export function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <Document>
      <h1>Oops {status}</h1>
      {statusText && <p>{statusText}</p>}
      <ServiceWorkerWarnring />
    </Document>
  );
}
