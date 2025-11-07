import sortBy from './sortBy.ts'

export function matchActiveLink<LinkDef extends { route: string }>(
  links: LinkDef[],
  route: string,
) {
  const links_sorted = sortBy(links, (link) => -link.route.length)
  return links_sorted.find((link: LinkDef) => route.startsWith(link.route))
}
