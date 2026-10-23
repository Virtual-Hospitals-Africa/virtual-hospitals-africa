// Notion pages and comments as the bot reads and writes them (docs/bot.md).
import type {
  BlockObjectResponse,
  CommentObjectResponse,
  PageObjectResponse,
  QueryDataSourceParameters,
  RichTextItemResponse,
  UpdatePageParameters,
} from '@notionhq/client'

const RICH_TEXT_LIMIT = 2000

/**
 * The bot's cards: ticked `Bot`, held ones included, so a held card is told apart from an unticked
 * one. The checkbox is the only gate: Tasks has no task type to filter on, and the connection the bot
 * runs as cannot be a Notion user, so it is never an Assignee.
 */
export const BOT_CARDS_FILTER: QueryDataSourceParameters['filter'] = {
  property: 'Bot',
  checkbox: { equals: true },
}

type BotPropertyType = 'checkbox' | 'select' | 'rich_text' | 'date' | 'url'

/** The properties the bot keeps on Tasks (docs/bot.md#setup). */
export const BOT_PROPERTIES: Record<string, { type: BotPropertyType; options?: string[] }> = {
  Bot: { type: 'checkbox' },
  'Bot hold': { type: 'checkbox' },
  'Bot state': {
    type: 'select',
    options: ['Queued', 'Working', 'Waiting on you', 'Queued for test run', 'Testing', 'Awaiting CI', 'Paused', 'Blocked', 'Finished'],
  },
  'Bot session': { type: 'rich_text' },
  Worktree: { type: 'rich_text' },
  'Last comment': { type: 'date' },
  PR: { type: 'url' },
}

/** Text as Notion rich text, split into the 2000-character runs Notion accepts. */
export const richText = (text: string) =>
  (text.match(new RegExp(`[\\s\\S]{1,${RICH_TEXT_LIMIT}}`, 'g')) ?? ['']).map((content) => ({
    type: 'text' as const,
    text: { content },
  }))

type PageProperties = NonNullable<UpdatePageParameters['properties']>
type FieldValue = string | boolean | null

const text = (field: string, value: FieldValue): string => {
  if (typeof value !== 'string') throw new Error(`${field} takes text, not ${String(value)}`)
  return value
}

/** The page properties for the fields the bot mirrors to Notion (bot/fold.ts desiredFields). */
export function propertiesOf(fields: Record<string, FieldValue>): PageProperties {
  const properties: PageProperties = {}
  for (const [field, value] of Object.entries(fields)) {
    switch (field) {
      case 'Bot state':
        properties[field] = { select: value === null ? null : { name: text(field, value) } }
        break
      case 'Status':
        properties[field] = { status: { name: text(field, value) } }
        break
      case 'Bot session':
      case 'Worktree':
        properties[field] = { rich_text: value === null ? [] : richText(text(field, value)) }
        break
      case 'PR':
        properties[field] = { url: value === null ? null : text(field, value) }
        break
      case 'Last comment':
        properties[field] = { date: value === null ? null : { start: text(field, value) } }
        break
      case 'Bot':
        if (typeof value !== 'boolean') throw new Error(`Bot takes true or false, not ${String(value)}`)
        properties[field] = { checkbox: value }
        break
      default:
        throw new Error(`the bot does not write ${field}`)
    }
  }
  return properties
}

/** Statuses the bot never moves a card out of: a human has taken it on to them, or the bot has. */
const SETTLED_STATUSES = ['QA', 'Done']

/** The fields to write over a card whose Status is `current`: a settled Status is left as it is. */
export function fieldsOver(fields: Record<string, FieldValue>, current: string): Record<string, FieldValue> {
  return SETTLED_STATUSES.includes(current) ? Object.fromEntries(Object.entries(fields).filter(([field]) => field !== 'Status')) : fields
}

export type PropertyGaps = {
  missing: string[]
  wrongType: { name: string; expected: string; actual: string }[]
}

/** Which bot properties a data source's schema lacks, or has with another type. */
export function propertyGaps(schema: Record<string, { type: string }>): PropertyGaps {
  const gaps: PropertyGaps = { missing: [], wrongType: [] }
  for (const [name, { type }] of Object.entries(BOT_PROPERTIES)) {
    const actual = schema[name]?.type
    if (actual === undefined) gaps.missing.push(name)
    else if (actual !== type) gaps.wrongType.push({ name, expected: type, actual })
  }
  return gaps
}

export type Card = {
  id: string
  url: string
  title: string
  status: string
  botState: string | null
  session: string | null
  worktree: string | null
  lastComment: string | null
  pr: string | null
  hold: boolean
  priority: 'High' | 'Medium' | 'Low' | null
  created: string
}

export type Reply = {
  id: string
  created: string
  author: string
  text: string
  files: { name: string; url: string }[]
}

type Property = PageObjectResponse['properties'][string]

// Tasks' Priority also has Postponed, which the bot ranks like no priority at all.
const PRIORITIES = ['High', 'Medium', 'Low'] as const

const plain = (parts: { plain_text: string }[]): string => parts.map((p) => p.plain_text).join('')

function textOf(property: Property | undefined): string | null {
  if (!property) return null
  switch (property.type) {
    case 'title':
      return plain(property.title) || null
    case 'rich_text':
      return plain(property.rich_text) || null
    case 'select':
      return property.select?.name ?? null
    case 'status':
      return property.status?.name ?? null
    case 'url':
      return property.url
    case 'date':
      return property.date?.start ?? null
    default:
      return null
  }
}

/** The card's title: Tasks calls the property `Name`, but whatever its name, it is the one of type title. */
const titleOf = (properties: PageObjectResponse['properties']): string | null => textOf(Object.values(properties).find((property) => property.type === 'title'))

const priorityOf = (value: string | null): Card['priority'] => PRIORITIES.find((priority) => priority === value) ?? null

export function cardOf(page: PageObjectResponse): Card {
  const p = page.properties
  const status = textOf(p.Status)
  if (status === null) throw new Error(`card ${page.id} has no Status`)
  const hold = p['Bot hold']
  return {
    id: page.id,
    url: page.url,
    title: titleOf(p) ?? '(untitled)',
    status,
    botState: textOf(p['Bot state']),
    session: textOf(p['Bot session']),
    worktree: textOf(p.Worktree),
    lastComment: textOf(p['Last comment']),
    pr: textOf(p.PR),
    hold: hold?.type === 'checkbox' ? hold.checkbox : false,
    priority: priorityOf(textOf(p.Priority)),
    created: page.created_time,
  }
}

/**
 * Comments from `since` on (oldest first) that the bot did not write itself. The boundary is
 * inclusive and compared as a date: Notion rounds comment times to the minute, so a second reply in
 * the same minute must not fall out; the caller drops the ones it has already handled by id.
 */
export function repliesSince(comments: CommentObjectResponse[], since: string | null, botUserId: string): Reply[] {
  const from = since === null ? null : Date.parse(since)
  return comments
    .filter((c) => c.created_by.id !== botUserId && (from === null || Date.parse(c.created_time) >= from))
    .sort((a, b) => a.created_time.localeCompare(b.created_time))
    .map((c) => ({
      id: c.id,
      created: c.created_time,
      author: c.display_name.resolved_name ?? c.created_by.id,
      text: plain(c.rich_text),
      files: (c.attachments ?? []).map((a, i) => ({ name: `${i + 1}-${a.category}`, url: a.file.url })),
    }))
}

/** A page block with its children, as the CLI fetches them. */
export type BlockNode = { block: BlockObjectResponse; children: BlockNode[] }

const linked = (parts: RichTextItemResponse[]): string => parts.map((p) => (p.href ? `[${p.plain_text}](${p.href})` : p.plain_text)).join('')

function imageUrl(block: Extract<BlockObjectResponse, { type: 'image' }>): string | null {
  const { image } = block
  if (image.type === 'external') return image.external.url
  if (image.type === 'file') return image.file.url
  return null
}

function lineOf(block: BlockObjectResponse): string {
  switch (block.type) {
    case 'paragraph':
      return linked(block.paragraph.rich_text)
    case 'heading_1':
      return `# ${linked(block.heading_1.rich_text)}`
    case 'heading_2':
      return `## ${linked(block.heading_2.rich_text)}`
    case 'heading_3':
      return `### ${linked(block.heading_3.rich_text)}`
    case 'bulleted_list_item':
      return `- ${linked(block.bulleted_list_item.rich_text)}`
    case 'numbered_list_item':
      return `1. ${linked(block.numbered_list_item.rich_text)}`
    case 'to_do':
      return `- [${block.to_do.checked ? 'x' : ' '}] ${linked(block.to_do.rich_text)}`
    case 'quote':
      return `> ${linked(block.quote.rich_text)}`
    case 'callout':
      return `> ${linked(block.callout.rich_text)}`
    case 'toggle':
      return linked(block.toggle.rich_text)
    case 'code':
      return `\`\`\`${block.code.language}\n${plain(block.code.rich_text)}\n\`\`\``
    case 'divider':
      return '---'
    case 'image': {
      const url = imageUrl(block)
      return url ? `![image](${url})` : '[image]'
    }
    default:
      return `[${block.type} block]`
  }
}

/**
 * The card as the worker's first prompt shows it. Many Tasks cards are only a title, so an empty body
 * says so rather than leaving a blank gap.
 */
export function cardDocument(card: Card, body: string): string {
  return [
    `# ${card.title}`,
    '',
    `- Status: ${card.status}`,
    `- Priority: ${card.priority ?? 'unset'}`,
    `- Link: ${card.url}`,
    '',
    body.trim() === '' ? '(The card has no description: the title is all there is. Ask in a comment if it is not enough.)' : body,
    '',
  ].join('\n')
}

/** The page body as Markdown: one line per block, children indented two spaces per level. */
export function markdownOf(nodes: BlockNode[], depth = 0): string {
  const indent = '  '.repeat(depth)
  return nodes
    .flatMap(({ block, children }) => [
      lineOf(block)
        .split('\n')
        .map((line) => indent + line)
        .join('\n'),
      ...(children.length > 0 ? [markdownOf(children, depth + 1)] : []),
    ])
    .join('\n')
}
