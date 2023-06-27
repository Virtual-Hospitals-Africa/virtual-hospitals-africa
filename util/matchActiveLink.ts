export default function matchActiveLink<T extends { href: string }>(
  links: T[],
  route: string,
) {
  return links.find((link: T) => route.startsWith(link.href))
}
