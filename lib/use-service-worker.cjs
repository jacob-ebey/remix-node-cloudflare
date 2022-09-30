let serviceWorkerState = {
  registration: null,
  serviceWorkerStatus: "register",
};

module.exports = function useServiceWorker() {
  return serviceWorkerState;
};
