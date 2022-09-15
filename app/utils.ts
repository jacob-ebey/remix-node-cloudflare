import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [state, setState] = useState<
    "unknown" | "unsupported" | ServiceWorkerState
  >("unknown");
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    let canceled = false;

    if ("serviceWorker" in navigator) {
      setState("installing");
      navigator.serviceWorker
        .register(`/sw.js?${__remixManifest.version}`)
        .then((registration) => {
          if (canceled) return;

          if (registration) {
            if (registration.active) {
              setState(registration.active.state);
            }

            const updateFoundHandler = () => {
              if (canceled) {
                registration.removeEventListener(
                  "updatefound",
                  updateFoundHandler
                );
                return;
              }
              setNeedsUpdate(true);
            };
            registration.addEventListener("updatefound", updateFoundHandler);
          }
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
