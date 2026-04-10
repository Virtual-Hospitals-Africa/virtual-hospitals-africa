import { a, u, b as s, aE as Header, A as AlertListener } from "../server-entry.mjs";
import { S as SimpleFooter } from "./Footer-CjAnK5R7.mjs";
const $$_tpl_1 = ["", "", '<section class="flex flex-col justify-between grow min-h-full p-6 align-center">', "</section>", ""];
function JustLogoLayout({
  url,
  title,
  children
}) {
  return a($$_tpl_1, u(AlertListener, {
    initial_url: url
  }), u(Header, {
    title,
    variant: "just logo"
  }), s(children), u(SimpleFooter, null));
}
export {
  JustLogoLayout as J
};
