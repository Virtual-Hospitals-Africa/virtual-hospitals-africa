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
const $$_tpl_1$1 = ['<header class="bg-white border-b border-slate-200"><div class="mx-auto max-w-3xl px-6 py-6">', "</div></header>"];
const $$_tpl_3 = ['<div class="flex flex-wrap gap-2">', "</div>"];
const $$_tpl_4 = ["<span ", ' class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">', "</span>"];
const $$_tpl_5 = ['<aside class="mt-16 border-t border-slate-200 pt-8"><h2 class="text-lg font-semibold text-slate-900 mb-4">Other Posts</h2><ul class="space-y-4">', "</ul></aside>"];
const $$_tpl_7 = ['<h3 class="text-base font-medium text-blue-600 group-hover:text-blue-800">', '</h3><p class="text-sm text-slate-600 mt-1">', '</p><time class="text-xs text-slate-500">', "</time>"];
const $$_tpl_6 = ["<li ", ">", "</li>"];
const $$_tpl_8 = ['<div class="min-h-screen flex flex-col">', '<main class="flex-1"><article class="mx-auto max-w-3xl px-6 py-12"><header class="mb-8"><h1 class="text-3xl font-bold text-slate-900">', "</h1>", '<div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">', '<time class="text-sm text-slate-500">', '</time><span class="text-sm text-slate-500">', " min read</span>", '</div></header><div class="prose prose-slate max-w-none">', "</div>", "</article></main>", "</div>"];
const $$_tpl_9 = ['<p class="text-xl text-slate-600 mt-2">', "</p>"];
const $$_tpl_10 = ['<span class="text-sm font-medium text-slate-700">', "</span>"];
function BlogHeader() {
  return a($$_tpl_1$1, u("a", {
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
function OtherPosts({
  posts
}) {
  if (posts.length === 0) return null;
  return a($$_tpl_5, s(posts.map((post) => a($$_tpl_6, l("key", post.slug), u("a", {
    href: `/blog/${post.slug}`,
    class: "group block",
    children: a($$_tpl_7, s(post.title), s(post.description), s(formatDate(post.date)))
  })))));
}
function LayoutBlogPost({
  title,
  subtitle,
  author,
  date,
  tags,
  word_count,
  other_posts,
  children
}) {
  return a($$_tpl_8, u(BlogHeader, null), s(title), s(subtitle && a($$_tpl_9, s(subtitle))), s(author && a($$_tpl_10, s(author))), s(formatDate(date)), s(Math.ceil(word_count / 200)), u(Tags, {
    tags
  }), s(children), u(OtherPosts, {
    posts: other_posts
  }), u(FullFooter, null));
}
const $$_tpl_1 = ["<div>Post not found</div>"];
const BLOG_POSTS = [{
  title: "Design Principles",
  subtitle: "The foundations of everything we build",
  author: "Will Weiss",
  slug: "design-principles",
  date: "2026-02-20",
  description: "Our core design principles for building healthcare technology",
  tags: ["tech", "medicine"],
  word_count: 738,
  html: "<h1>Design Principles</h1>\n<p>At Virtual Hospitals Africa, our mission is to ensure that patients who need it can see a doctor that day. T</p>\n<h2>Patient First</h2>\n<p>Every decision starts with the patient. Technology should serve people, not the other way around.</p>\n<h2>Simplicity</h2>\n<p>Healthcare is complex enough. Our tools should make it simpler, not add another layer of confusion.</p>\n<h2>Accessibility</h2>\n<p>Healthcare technology must work for everyone - regardless of device, connectivity, or technical literacy.</p>\n<h2>Reliability</h2>\n<p>When health is on the line, systems must work. Every time.</p>\n<h3>XYA</h3>\n<p>Three people will list the same diagnosis three different ways. Or an orthopedist will list the same generic symptom for every patient (“pain in leg”), which is sufficient for billing purposes but not useful to colleagues who need to know the specific diagnosis (e.g., “osteoarthritis in the right knee”)</p>\n<p>Or someone will add “anemia” to the problem list but not have the expertise to record the relevant details; Sadoughi needs to know that it’s “anemia due to iron deficiency, last colonoscopy 2017.”</p>\n<p>With computers, however, the shortcut is to paste in whole blocks of information—an entire two-page imaging report, say—rather than selecting the relevant details. The next doctor must hunt through several pages to find what really matters. Multiply that by twenty-some patients a day, and you can see Sadoughi’s problem.</p>\n<p>“Ordering a mammogram used to be one click,” she said. “Now I spend three extra clicks to put in a diagnosis. When I do a Pap smear, I have eleven clicks. It’s ‘Oh, who did it?’ Why not, by default, think that I did it?” She was almost shouting now. “I’m the one putting the order in. Why is it asking me what date, if the patient is in the office today? When do you think this actually happened? It is incredible!” The Revenge of the Ancillaries, I thought.</p>\n<p>As a program adapts and serves more people and more functions, it naturally requires tighter regulation. Software systems govern how we interact as groups, and that makes them unavoidably bureaucratic in nature. There will always be those who want to maintain the system and those who want to push the system’s boundaries. Conservatives and liberals emerge.</p>\n<p>Scientists now talked of “old Fluidity,” the smaller program with fewer collaborators which left scientists free to develop their own idiosyncratic styles of research, and “new Fluidity,” which had many more users and was, accordingly, more rule-bound. Changes required committees, negotiations, unsatisfactory split-the-difference solutions. Many scientists complained to Spencer in the way that doctors do—they were spending so much time on the requirements of the software that they were losing time for actual research. “I just want to do science!” one scientist lamented.</p>\n<p>Yet none could point to a better way. “While interviewees would make their resistance known to me,” Spencer wrote, “none of them went so far as to claim that Fluidity could be better run in a different manner.” New Fluidity had capabilities that no small, personalized system could ever provide and that the scientists couldn’t replace.</p>\n<p>Sadoughi told me of her own struggles—including a daily battle with her Epic “In Basket,” which had become, she said, clogged to the point of dysfunction. There are messages from patients, messages containing lab and radiology results, messages from colleagues, messages from administrators, automated messages about not responding to previous messages. “All the letters that come from the subspecialists, I can’t read ninety per cent of them. So I glance at the patient’s name, and, if it’s someone that I was worried about, I’ll read that,” she said. The rest she deletes, unread. “If it’s just a routine follow-up with an endocrinologist, I hope to God that if there was something going on that they needed my attention on, they would send me an e-mail.” In short, she hopes they’ll try to reach her at yet another in-box.</p>\n<p>  =&gt; tiered support, harder to message up than down</p>\n<p>Previously, she sorted the patient records before clinic, drafted letters to patients, prepped routine prescriptions—all tasks that lightened the doctors’ load. None of this was possible anymore. The doctors had to do it all themselves. She called it “a ‘stay in your lane’ thing.” She couldn’t even help the doctors navigate and streamline their computer systems: office assistants have different screens and are not trained or authorized to use the ones doctors have.</p>\n<p>  =&gt; Health workers across the system can support</p>\n<p>Save time for doctors</p>\n"
}, {
  title: "Building a Rules Engine",
  subtitle: "Clinical decision support with S-expressions",
  author: void 0,
  slug: "rules-engine",
  date: "2024-01-20",
  description: "How we built our clinical decision support rules engine",
  tags: ["tech", "medicine", "analytics"],
  word_count: 80,
  html: "<h1>Building a Rules Engine</h1>\n<p>Clinical decision support requires a flexible, maintainable rules engine.</p>\n<h2>The Challenge</h2>\n<p>Healthcare protocols are complex and constantly evolving. We needed a system that:</p>\n<ul>\n<li>Could be updated without code changes</li>\n<li>Was readable by clinical staff</li>\n<li>Could handle complex conditional logic</li>\n</ul>\n<h2>Our Approach</h2>\n<p>We chose to use S-expressions as our rules language, providing both power and clarity.</p>\n<h2>Results</h2>\n<p>The rules engine now powers our triage system, medication interactions, and clinical alerts.</p>\n"
}];
const POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]));
function BlogPostPage(ctx) {
  const {
    post: slug
  } = ctx.params;
  const post = POSTS_BY_SLUG.get(slug);
  if (!post) {
    return ctx.render(a($$_tpl_1), {
      status: 404
    });
  }
  const other_posts = BLOG_POSTS.filter((p) => p.slug !== slug);
  const html_content = u("div", {
    dangerouslySetInnerHTML: {
      __html: post.html
    }
  });
  return u(LayoutBlogPost, {
    title: post.title,
    subtitle: post.subtitle,
    author: post.author,
    date: post.date,
    tags: post.tags,
    word_count: post.word_count,
    other_posts,
    children: html_content
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___blog_post_ = BlogPostPage;
export {
  config,
  css,
  _freshRoute___blog_post_ as default,
  handler,
  handlers
};
