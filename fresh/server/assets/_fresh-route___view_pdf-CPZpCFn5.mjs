import { a, u, P as PdfViewer } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ['<div class="flex items-center justify-center h-screen bg-gray-900 text-white"><p>Invalid file parameter.</p></div>'];
function ViewPdfPage({
  url
}) {
  const file = url.searchParams.get("file") ?? "";
  if (!file || file.includes("..")) {
    return a($$_tpl_1);
  }
  const file_url = `/${file}`;
  return u(PdfViewer, {
    file_url
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___view_pdf = ViewPdfPage;
export {
  config,
  css,
  _freshRoute___view_pdf as default,
  handler,
  handlers
};
