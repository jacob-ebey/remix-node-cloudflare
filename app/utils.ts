import { useEffect, useState } from "react";
import { useMatches } from "@remix-run/react";

let globalRegistration: Promise<ServiceWorkerRegistration | undefined>;
export async function registerServiceWorker() {
  if (!globalRegistration) {
    if (
      "serviceWorker" in navigator &&
      !__remixContext.matches
        .slice(-1)[0]
        .route.id.startsWith("routes/service-worker")
    ) {
      globalRegistration = navigator.serviceWorker.register(
        `/sw.js?${__remixManifest.version}`
      );
    }
  }

  return await globalRegistration;
}

export function useIsServiceWorkerRoute() {
  const matches = useMatches();
  return (
    matches &&
    matches.length > 0 &&
    matches.slice(-1)[0].id.startsWith("routes/service-worker")
  );
}

export function useServiceWorker() {
  const [state, setState] = useState<
    "unknown" | "unsupported" | ServiceWorkerState
  >("unknown");
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const isServiceWorkerRoute = useIsServiceWorkerRoute();

  useEffect(() => {
    let canceled = false;

    if (
      __remixContext.matches &&
      __remixContext.matches.length > 0 &&
      __remixContext.matches
        .slice(-1)[0]
        .route.id.startsWith("routes/service-worker")
    ) {
      setState("unsupported");
      return;
    } else if ("serviceWorker" in navigator && !isServiceWorkerRoute) {
      setState("installing");
      registerServiceWorker()
        .then((registration) => {
          if (canceled || !registration) return;

          if (registration.active) {
            setState(registration.active.state);
          }

          const updateFoundHandler = () => {
            if (
              canceled ||
              (__remixContext.matches &&
                __remixContext.matches.length > 0 &&
                __remixContext.matches
                  .slice(-1)[0]
                  .route.id.startsWith("routes/service-worker"))
            ) {
              registration.removeEventListener(
                "updatefound",
                updateFoundHandler
              );
              return;
            }
            setNeedsUpdate(true);
          };
          registration.addEventListener("updatefound", updateFoundHandler);
        })
        .catch((error) => {
          console.error("Error during service worker registration:", error);
        });
    } else {
      setState("unsupported");
    }

    return () => {
      canceled = true;
    };
  }, []);

  return { state, needsUpdate };
}
