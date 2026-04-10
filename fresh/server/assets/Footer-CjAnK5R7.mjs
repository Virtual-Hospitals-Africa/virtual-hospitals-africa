import { a, u, az as BuiltWith, b as s } from "../server-entry.mjs";
const $$_tpl_1 = ["© ", " Virtual Hospitals Africa"];
const $$_tpl_2 = ['<footer class="relative flex flex-col-reverse md:flex-row w-full items-between p-6 pt-5 sm:pt-14 justify-between items-center self-end"><div class="relative text-sm text-slate-600 mt-8 md:mt-auto"><p>', "</p></div></footer>"];
const $$_tpl_3 = ['<footer class="bg-white"><div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8"><nav aria-label="Footer" class="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6">', '</nav><div class="mt-16 flex justify-center gap-x-10">', '</div><p class="mt-10 text-center text-sm/6 text-gray-600">', "</p></div></footer>"];
function Copyright() {
  return a($$_tpl_1, s((/* @__PURE__ */ new Date()).getFullYear()));
}
function SimpleFooter() {
  return a($$_tpl_2, u(Copyright, null));
}
const navigation = {
  main: [{
    name: "Privacy Policy",
    href: "/privacy.html"
  }, {
    name: "Terms of Service",
    href: "/terms-of-service.html"
  }]
};
function FullFooter() {
  return a($$_tpl_3, s(navigation.main.map((item) => u("a", {
    href: item.href,
    class: "text-gray-600 hover:text-gray-900",
    children: item.name
  }, item.name))), u(BuiltWith, null), u(Copyright, null));
}
export {
  FullFooter as F,
  SimpleFooter as S
};
