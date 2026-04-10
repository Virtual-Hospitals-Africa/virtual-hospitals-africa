import { a, b as s, u, aF as PageHeader } from "../server-entry.mjs";
const $$_tpl_1 = ['<div class="overflow-hidden bg-white py-12"><div class="mx-auto max-w-7xl px-6 lg:flex lg:px-8"><div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">', '<div class="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">', '</div><div class="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents"><div class="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-start">', "</div></div></div></div></div>"];
function SideBySideImage({
  src
}) {
  return u("img", {
    src,
    alt: "",
    class: "aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
  });
}
function SideBySide({
  h1,
  image,
  children
}) {
  return a($$_tpl_1, u(PageHeader, {
    className: "h1",
    children: h1
  }), s(children), s(typeof image === "string" ? u(SideBySideImage, {
    src: image
  }) : image));
}
export {
  SideBySide as S
};
