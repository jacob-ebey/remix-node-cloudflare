declare module "#handle-document-request" {
  import { HandleDocumentRequestFunction } from "@remix-run/cloudflare";
  const handleDocumentRequest: HandleDocumentRequestFunction;
  export default handleDocumentRequest;
}
