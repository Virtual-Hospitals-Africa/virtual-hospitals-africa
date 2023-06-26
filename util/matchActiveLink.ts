import { LinkDef } from '../types.ts'

export default function matchActiveLink(links: LinkDef[], route: string) {
  return links.find((link: LinkDef) => route.startsWith(link.href))
}
