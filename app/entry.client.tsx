import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

import { registerServiceWorker } from "~/utils";

hydrateRoot(document, <RemixBrowser />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    registerServiceWorker();
  });
}
