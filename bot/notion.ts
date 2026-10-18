// The bot's only door to Notion (docs/bot.md). JSON on stdout.
//   notion.ts poll                          the board → events for what humans did (notion-reader.sh)
//   notion.ts job < <job json>              one write the mirror lacks (notion-writer.sh)
//   notion.ts comments <page> --since <ISO|""> --into <dir>
//   notion.ts card-markdown <page>
//   notion.ts whoami | cards | check | add-properties
import { parseArgs } from '@std/cli/parse-args'
import {
  Client,
  type CommentObjectResponse,
  type DataSourceObjectResponse,
  isFullBlock,
  isFullComment,
  isFullDataSource,
  isFullPage,
  iteratePaginatedAPI,
  type UpdateDataSourceParameters,
} from '@notionhq/client'
import { assert } from 'std/assert/assert.ts'
import { basename } from 'std/path/basename.ts'
import { join } from 'std/path/join.ts'
import { z } from 'zod'

import { appendEvent, loadWorld } from './eventLog.ts'
import { writeOut } from './io.ts'
import {
  type BlockNode,
  BOT_CARDS_FILTER,
  BOT_PROPERTIES,
  type Card,
  cardDocument,
  cardOf,
  fieldsOver,
  markdownOf,
  propertiesOf,
  propertyGaps,
  repliesSince,
  type Reply,
  richText,
} from './notionModel.ts'
import { awaitingReplies, boardEvents, repliesFrom } from './reader.ts'

// VHA's "✅ Tasks" (database c41db9df-9eae-467d-92d2-5211e065d117, in the More Human Internet workspace).
// The API queries its data source; the database id is the one a connection is added to in Notion.
const DEFAULT_DATA_SOURCE_ID = '393974e4-e036-4daa-85b5-54dabbac00e9'
const DATA_SOURCE_ID = Deno.env.get('NOTION_DATA_SOURCE_ID') || DEFAULT_DATA_SOURCE_ID
const NOTION_VERSION = '2025-09-03'

const token = Deno.env.get('NOTION_TOKEN')
assert(token, 'NOTION_TOKEN is unset (.bot/bot.env)')
const notion = new Client({ auth: token, notionVersion: NOTION_VERSION })

const out = (value: unknown) => writeOut(`${JSON.stringify(value)}\n`)

async function botUserId(): Promise<string> {
  return (await notion.users.me({})).id
}

async function whoami() {
  out({ id: await botUserId() })
}

async function tasksSource(): Promise<DataSourceObjectResponse> {
  const source = await notion.dataSources.retrieve({ data_source_id: DATA_SOURCE_ID })
  assert(isFullDataSource(source), 'the Tasks data source is not readable — connect the integration to it')
  return source
}

/** The connection's name and the bot properties Tasks lacks (bot/setup.sh). */
async function check() {
  const me = await notion.users.me({})
  out({ connection: me.name ?? me.id, ...propertyGaps((await tasksSource()).properties) })
}

type PropertyConfig = NonNullable<UpdateDataSourceParameters['properties']>[string]

function propertyConfig({ type, options }: (typeof BOT_PROPERTIES)[string]): PropertyConfig {
  switch (type) {
    case 'checkbox':
      return { checkbox: {} }
    case 'select':
      return { select: { options: (options ?? []).map((name) => ({ name })) } }
    case 'rich_text':
      return { rich_text: {} }
    case 'date':
      return { date: {} }
    case 'url':
      return { url: {} }
  }
}

/** Adds the bot properties Tasks lacks; never changes one that exists. */
async function addProperties() {
  const { missing } = propertyGaps((await tasksSource()).properties)
  if (missing.length > 0) {
    await notion.dataSources.update({
      data_source_id: DATA_SOURCE_ID,
      properties: Object.fromEntries(missing.map((name) => [name, propertyConfig(BOT_PROPERTIES[name])])),
    })
  }
  out({ added: missing })
}

/** Every card ticked for the bot, held ones included; a Done card only while it has a worktree. */
async function botCards(): Promise<Card[]> {
  const found: Card[] = []
  for await (
    const page of iteratePaginatedAPI(notion.dataSources.query, {
      data_source_id: DATA_SOURCE_ID,
      filter: BOT_CARDS_FILTER,
    })
  ) {
    if (isFullPage(page)) found.push(cardOf(page))
  }
  return found.filter((card) => card.status !== 'Done' || card.worktree !== null)
}

async function cards() {
  out(await botCards())
}

async function download(url: string, path: string) {
  const response = await fetch(url)
  assert(response.ok, `download of ${url} failed: HTTP ${response.status}`)
  Deno.writeFileSync(path, new Uint8Array(await response.arrayBuffer()))
}

/**
 * Replies on a page from `since` on that are not in `seen`, their attachments downloaded into
 * `<into>/<comment id>/` (each file's url becomes its path).
 */
async function fetchReplies(page: string, since: string | null, into: string, seen: Set<string>, me: string) {
  const all: CommentObjectResponse[] = []
  for await (const comment of iteratePaginatedAPI(notion.comments.list, { block_id: page })) {
    if (isFullComment(comment)) all.push(comment)
  }
  const replies = repliesSince(all, since, me).filter((reply) => !seen.has(reply.id))
  for (const reply of replies) {
    if (reply.files.length === 0) continue
    const dir = join(into, reply.id)
    Deno.mkdirSync(dir, { recursive: true })
    for (const file of reply.files) {
      const path = join(dir, file.name)
      await download(file.url, path)
      file.url = path
    }
  }
  return replies
}

async function comments(page: string, since: string, into: string) {
  out(await fetchReplies(page, since === '' ? null : since, into, new Set(), await botUserId()))
}

/** One look at the board: what humans did since the last look, appended as events. */
async function poll() {
  const board = await botCards()
  let world = loadWorld()
  for (const draft of boardEvents(board, world)) world = appendEvent(draft)
  const me = await botUserId()
  for (const card of awaitingReplies(world)) {
    assert(card.worktree, `card ${card.id} awaits replies but has no worktree`)
    const inbox = join(card.worktree.path, '.vha', 'inbox')
    const replies: Reply[] = await fetchReplies(card.id, repliesFrom(card), inbox, card.seenComments, me)
    const newest = replies.at(-1)?.created
    if (newest === undefined) continue
    Deno.mkdirSync(inbox, { recursive: true })
    const file = join(inbox, `replies-${newest.replace(/[^0-9]/g, '')}.json`)
    Deno.writeTextFileSync(file, JSON.stringify(replies, null, 2))
    world = appendEvent({ type: 'card.replied', card: card.id, commentIds: replies.map((r) => r.id), newest, file })
  }
}

const job_schema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('set'), card: z.string(), fields: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])) }),
  z.object({ kind: z.literal('comment'), card: z.string(), text: z.string().min(1), attach: z.array(z.string()) }),
])

/**
 * One write the mirror lacks, as `bot/state.ts next notion` describes it, read from stdin. A card
 * already in QA or Done keeps that Status.
 */
async function job() {
  const input = job_schema.parse(JSON.parse(await new Response(Deno.stdin.readable).text()))
  if (input.kind === 'set') {
    const fields = 'Status' in input.fields ? fieldsOver(input.fields, (await cardPage(input.card)).status) : input.fields
    if (Object.keys(fields).length > 0) await notion.pages.update({ page_id: input.card, properties: propertiesOf(fields) })
  } else {
    await comment(input.card, input.text, input.attach)
  }
}

async function upload(path: string): Promise<string> {
  const created = await notion.fileUploads.create({ mode: 'single_part', filename: basename(path) })
  await notion.fileUploads.send({
    file_upload_id: created.id,
    file: { filename: basename(path), data: new Blob([Deno.readFileSync(path)]) },
  })
  return created.id
}

async function comment(page: string, text: string, attach: string[]) {
  const attachments = []
  for (const path of attach) attachments.push({ file_upload_id: await upload(path) })
  await notion.comments.create({ parent: { page_id: page }, rich_text: richText(text), attachments })
}

async function blockTree(parent: string): Promise<BlockNode[]> {
  const nodes: BlockNode[] = []
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, { block_id: parent })) {
    if (!isFullBlock(block)) continue
    nodes.push({ block, children: block.has_children ? await blockTree(block.id) : [] })
  }
  return nodes
}

async function cardPage(page: string): Promise<Card> {
  const retrieved = await notion.pages.retrieve({ page_id: page })
  assert(isFullPage(retrieved), `page ${page} is not readable`)
  return cardOf(retrieved)
}

async function cardMarkdown(page: string) {
  const card = await cardPage(page)
  writeOut(cardDocument(card, markdownOf(await blockTree(page))))
}

// `_` among the strings keeps a page id that happens to be all digits a string.
const { _: positionals, since, into } = parseArgs(Deno.args, { string: ['since', 'into', '_'] })
const [command, page] = positionals.map(String)

const needsPage = (run: (page: string) => Promise<void>) => () => {
  assert(page, `${command}: a page id is required`)
  return run(page)
}

const commands: Record<string, () => Promise<void>> = {
  whoami,
  check,
  'add-properties': addProperties,
  cards,
  poll,
  job,
  comments: needsPage((p) => comments(p, since ?? '', into ?? '.')),
  'card-markdown': needsPage(cardMarkdown),
}

const handler = command ? commands[command] : undefined
assert(handler, `usage: notion.ts ${Object.keys(commands).join(' | ')} [page] [flags]`)
handler().catch((error: unknown) => {
  console.error(error)
  Deno.exit(1)
})
