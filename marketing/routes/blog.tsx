// Auto-generated from /blog/*.md
// Do not edit manually - run `deno task compile:blog` to regenerate

import LayoutBlogIndex from '../../components/library/layout/BlogIndex.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  slug: string
  date: string
  description: string
  tags: string[]
  word_count: number
  hero_image?: string
  wide_image?: string
}

const BLOG_POSTS: BlogPostMeta[] = [
  {
    title: 'How Health Workers Can Love Their Devices',
    subtitle: 'Learning from Dr. Atul Gawande how to gain in efficiency while letting practitioners focus on care',
    author: undefined,
    slug: 'how-health-workers-can-love-their-devices',
    date: '2026-04-17',
    description: 'How we built our clinical decision support rules engine',
    tags: ['ux design', 'medicine'],
    word_count: 1660,
    hero_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet.png',
    wide_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet-wide.png',
  },
]

export default function BlogIndexPage() {
  return <LayoutBlogIndex posts={BLOG_POSTS} />
}
