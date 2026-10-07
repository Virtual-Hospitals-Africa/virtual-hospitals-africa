import sortBy from './sortBy.ts'

type ActiveLink = {
  route: string
  active_routes?: readonly string[]
}

function longestMatchingRouteLength(link: ActiveLink, route: string) {
  const candidates = link.active_routes ? [link.route, ...link.active_routes] : [link.route]
  return candidates.reduce((longest, candidate) => {
    if (!route.startsWith(candidate)) return longest
    if (candidate.length > longest) return candidate.length
    return longest
  }, 0)
}

export function matchActiveLink<Link extends ActiveLink>(
  links: Link[],
  route: string,
) {
  const links_sorted = sortBy(links, (link) => -longestMatchingRouteLength(link, route))
  return links_sorted.find((link) => longestMatchingRouteLength(link, route) > 0)
}
