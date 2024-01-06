import sortBy from './sortBy.ts'

export default function matchActiveLink<LinkDef extends { route: string }>(
  links: LinkDef[],
  route: string,
) {
  const linksSorted = sortBy(links, (link) => -link.route.length)
  return linksSorted.find((link: LinkDef) => route.startsWith(link.route))
}
