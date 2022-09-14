export function mergeBuilds(remixBrowserBuild, remixServerBuild, prefixFilter) {
  const routes = {
    ...Object.fromEntries(
      Object.entries(remixBrowserBuild.routes).filter(
        (e) => !e[0].startsWith(prefixFilter)
      )
    ),
    ...remixServerBuild.routes,
  };

  for (const routeId of Object.keys(routes)) {
    const parentId = findParentRouteId(Object.keys(routes), routeId);
    if (parentId) {
      routes[routeId].parentId = parentId;
      routes[routeId].path = routes[routeId].path.replace(
        new RegExp(`^${routes[parentId].path}/`),
        ""
      );
    }
  }

  const assetRoutes = remixBrowserBuild.assets.routes;
  for (const routeid of Object.keys(assetRoutes)) {
    const parentId = findParentRouteId(Object.keys(assetRoutes), routeid);
    if (parentId) {
      assetRoutes[routeid].parentId = parentId;
      assetRoutes[routeid].path = assetRoutes[routeid].path.replace(
        new RegExp(`^${assetRoutes[parentId].path}/`),
        ""
      );
    }
  }

  return {
    ...remixServerBuild,
    assets: {
      ...remixBrowserBuild.assets,
      routes: assetRoutes,
    },
    routes,
  };
}

function findParentRouteId(routeIds, childRouteId) {
  childRouteId = platformAgnosticId(childRouteId);
  return routeIds.find(
    (id) =>
      platformAgnosticId(id) !== childRouteId &&
      childRouteId.startsWith(platformAgnosticId(id) + ".")
  );
}

function platformAgnosticId(id) {
  return id.replace(/^routes\/(cloudflare|node|common)\//, "routes/");
}
