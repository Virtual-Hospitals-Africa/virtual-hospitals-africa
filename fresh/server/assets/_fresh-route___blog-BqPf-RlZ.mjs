import { a, u, b as s, l } from "../server-entry.mjs";
import { F as FullFooter } from "./Footer-CjAnK5R7.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_2 = ['<span class="text-lg font-semibold text-slate-900">Virtual Hospitals Africa</span>'];
const $$_tpl_1 = ['<header class="bg-white border-b border-slate-200"><div class="mx-auto max-w-3xl px-6 py-6">', "</div></header>"];
const $$_tpl_3 = ['<div class="flex flex-wrap gap-2 mt-2">', "</div>"];
const $$_tpl_4 = ["<span ", ' class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">', "</span>"];
const $$_tpl_5 = ['<div class="min-h-screen flex flex-col">', '<main class="flex-1"><div class="mx-auto max-w-3xl px-6 py-12"><h1 class="text-3xl font-bold text-slate-900 mb-8">Blog</h1><ul class="space-y-8">', "</ul></div></main>", "</div>"];
const $$_tpl_7 = ['<article><h2 class="text-xl font-semibold text-blue-600 group-hover:text-blue-800">', "</h2>", '<p class="text-slate-600 mt-2">', '</p><div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">', '<time class="text-sm text-slate-500">', '</time><span class="text-sm text-slate-500">', " min read</span>", "</div></article>"];
const $$_tpl_6 = ["<li ", ">", "</li>"];
const $$_tpl_8 = ['<p class="text-lg text-slate-500 mt-1">', "</p>"];
const $$_tpl_9 = ['<span class="text-sm font-medium text-slate-700">', "</span>"];
function BlogHeader() {
  return a($$_tpl_1, u("a", {
    href: "/",
    class: "flex items-center gap-3",
    children: [u("img", {
      src: "/images/logo.svg",
      alt: "Virtual Hospitals Africa",
      class: "h-8 w-8"
    }), a($$_tpl_2)]
  }));
}
function formatDate(date_string) {
  const date = new Date(date_string);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function Tags({
  tags
}) {
  if (tags.length === 0) return null;
  return a($$_tpl_3, s(tags.map((tag) => a($$_tpl_4, l("key", tag), s(tag)))));
}
function LayoutBlogIndex({
  posts
}) {
  return a($$_tpl_5, u(BlogHeader, null), s(posts.map((post) => a($$_tpl_6, l("key", post.slug), u("a", {
    href: `/blog/${post.slug}`,
    class: "group block",
    children: a($$_tpl_7, s(post.title), s(post.subtitle && a($$_tpl_8, s(post.subtitle))), s(post.description), s(post.author && a($$_tpl_9, s(post.author))), s(formatDate(post.date)), s(Math.ceil(post.word_count / 200)), u(Tags, {
      tags: post.tags
    }))
  })))), u(FullFooter, null));
}
const BLOG_POSTS = [{
  title: "Design Principles",
  subtitle: "The foundations of everything we build",
  author: "Will Weiss",
  slug: "design-principles",
  date: "2026-02-20",
  description: "Our core design principles for building healthcare technology",
  tags: ["tech", "medicine"],
  word_count: 738
}, {
  title: "Building a Rules Engine",
  subtitle: "Clinical decision support with S-expressions",
  author: void 0,
  slug: "rules-engine",
  date: "2024-01-20",
  description: "How we built our clinical decision support rules engine",
  tags: ["tech", "medicine", "analytics"],
  word_count: 80
}];
function BlogIndexPage() {
  return u(LayoutBlogIndex, {
    posts: BLOG_POSTS
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___blog = BlogIndexPage;
export {
  config,
  css,
  _freshRoute___blog as default,
  handler,
  handlers
};
