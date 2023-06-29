import sortBy from './sortBy.ts'

export default function matchActiveLink<T extends { href: string }>(
  links: T[],
) {
  const linksSorted = sortBy(links, (link) => -link.href.length)
  return (route: string) =>
    linksSorted.find((link: T) => route.startsWith(link.href))
}
