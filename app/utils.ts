import { useMatches } from "@remix-run/react";

export function useIsServiceWorkerRoute() {
  const matches = useMatches();
  return (
    matches &&
    matches.length > 0 &&
    matches.slice(-1)[0].id.startsWith("routes/service-worker")
  );
}
