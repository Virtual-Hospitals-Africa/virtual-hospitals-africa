import * as cheerio from 'cheerio'

export type DOMNode = {
  tag: string
  text?: string
  children?: DOMNode[]
}

export function getDOMTree(
  $: cheerio.CheerioAPI,
  selector: string,
): DOMNode | null {
  const el = $(selector)
  if (!el.length) return null
  return extractTree($, el)
}

function extractTree(
  $: cheerio.CheerioAPI,
  el: ReturnType<cheerio.CheerioAPI>,
): DOMNode {
  const tag = el.prop('tagName')?.toLowerCase() ?? ''
  const children = el.children()

  if (!children.length) {
    const text = el.text().trim()
    return text ? { tag, text } : { tag }
  }

  const child_nodes: DOMNode[] = []
  children.each((_, child) => {
    child_nodes.push(extractTree($, $(child)))
  })

  return { tag, children: child_nodes }
}
