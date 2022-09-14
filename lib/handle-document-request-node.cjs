const { PassThrough } = require("stream");
const React = require("react");
const ReactDOM = require("react-dom/server");
const { Response } = require("@remix-run/node");
const { RemixServer } = require("@remix-run/react");
const isbot = require("isbot");

const ABORT_DELAY = 5000;

module.exports = function handleNodeRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;
    const isBot = isbot(request.headers.get("User-Agent"));
    const method = isBot ? "onAllReady" : "onShellReady";

    const { pipe, abort } = ReactDOM.renderToPipeableStream(
      React.createElement(RemixServer, {
        context: remixContext,
        url: request.url,
      }),
      {
        [method]: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError: (err) => {
          reject(err);
        },
        onError: (error) => {
          didError = true;

          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
};
