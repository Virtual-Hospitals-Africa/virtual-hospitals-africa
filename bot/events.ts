// Every event the bot appends to .bot/events.jsonl (docs/bot.md#events). One schema validates each
// line as it is written and as it is read.
import { z } from 'zod'

export const CARD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** A line stays one write(): appends from several processes never interleave below this size. */
export const MAX_EVENT_BYTES = 4096

const ts = z.iso.datetime()
const card = z.string().regex(CARD_ID)
const priority = z.enum(['High', 'Medium', 'Low']).nullable()
const path = z.string().min(1)
const request = z.number().int().positive()
const test_kind = z.enum(['run', 'hand'])
const sha = z.string().regex(/^[0-9a-f]{40}$/)

function cardEvent<T extends string, S extends z.ZodRawShape>(type: T, shape: S) {
  return z.strictObject({ ts, card, type: z.literal(type), ...shape })
}

export const event_schema = z.discriminatedUnion('type', [
  cardEvent('card.admitted', { title: z.string().min(1), priority, created: ts }),
  cardEvent('card.reprioritized', { priority }),
  cardEvent('card.replied', { commentIds: z.array(z.string().min(1)).min(1), newest: ts, file: path }),
  cardEvent('card.talked', {}),
  cardEvent('card.unblocked', {}),
  cardEvent('card.held', {}),
  cardEvent('card.released', {}),
  cardEvent('card.withdrawn', { by: z.enum(['notion', 'kill']) }),
  cardEvent('card.done', {}),

  cardEvent('worktree.created', { path, branch: z.string().min(1), portIndex: z.number().int().min(1) }),
  // `resource`: what the card's resources lack that retrying will not fix, so it is blocked at once.
  cardEvent('worktree.failed', { error: z.string(), resource: z.enum(['dump_missing', 'dump_stale']).optional() }),
  cardEvent('worktree.removed', {}),
  cardEvent('worktree.unmerged', { why: z.enum(['would-not-merge', 'talking']) }),

  cardEvent('worker.launched', {}),
  cardEvent('worker.session', { session: z.string().min(1) }),
  cardEvent('worker.outcome', { kind: z.enum(['ask', 'run', 'blocked']), file: path }),
  cardEvent('worker.failed', {
    why: z.enum(['no_outcome', 'bad_outcome', 'crashed', 'overran']),
    detail: z.string(),
  }),
  cardEvent('worker.usage_limited', { until: ts }),
  cardEvent('worker.interrupted', {}),
  cardEvent('checks.started', { file: path }),
  cardEvent('checks.failed', {
    result: z.enum(['failed', 'conflicted', 'refused']),
    log: path.nullable(),
    failure: z.string(),
    files: z.array(z.string()),
  }),

  cardEvent('test.requested', { command: z.string().min(1), servers: z.boolean() }),
  cardEvent('test.launched', { request, tester: z.number().int().min(1) }),
  cardEvent('test.conflicted', { request }),
  cardEvent('test.refused', { request, files: z.array(z.string()) }),
  cardEvent('test.finished', {
    request,
    kind: test_kind,
    runDir: path.nullable(),
    exitCode: z.number().int(),
    failure: z.string().nullable(),
  }),
  cardEvent('test.interrupted', { request }),
  cardEvent('pr.failed', { error: z.string() }),
  cardEvent('pr.pushed', { url: z.url(), sha }),
  cardEvent('pr.merged', { url: z.url() }),
  cardEvent('ci.passed', { url: z.url(), sha }),
  cardEvent('ci.failed', { url: z.url(), sha, failure: z.string().min(1) }),

  cardEvent('notion.wrote', { fields: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])) }),
  cardEvent('notion.commented', { for: z.number().int().positive() }),
])

export type BotEvent = z.infer<typeof event_schema>
export type EventType = BotEvent['type']
export type EventOf<T extends EventType> = Extract<BotEvent, { type: T }>
/** An event with its id: its 1-based line number in the log, stable because the log only grows. */
export type Logged = BotEvent & { id: number }

/** Parses the whole log, failing on the first line that is not a valid event (named by number). */
export function parseLog(text: string): Logged[] {
  const lines = text.split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines.map((line, index) => {
    const id = index + 1
    let json: unknown
    try {
      json = JSON.parse(line)
    } catch {
      throw new Error(`events.jsonl line ${id} is not JSON: ${line.slice(0, 120)}`)
    }
    const parsed = event_schema.safeParse(json)
    if (!parsed.success) {
      throw new Error(`events.jsonl line ${id} is not a valid event: ${z.prettifyError(parsed.error)}`)
    }
    return { ...parsed.data, id }
  })
}

/** The line to append for an event (with its ts filled in when absent), or why it cannot be written. */
export function lineOf(input: unknown, now: Date): string {
  const with_ts = typeof input === 'object' && input !== null && !('ts' in input) ? { ts: now.toISOString(), ...input } : input
  const event = event_schema.parse(with_ts)
  const line = `${JSON.stringify(event)}\n`
  const bytes = new TextEncoder().encode(line).length
  if (bytes > MAX_EVENT_BYTES) throw new Error(`event is ${bytes} bytes; the limit is ${MAX_EVENT_BYTES}`)
  return line
}
