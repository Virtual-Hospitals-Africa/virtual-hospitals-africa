// The event log on disk, .bot/events.jsonl, for every TypeScript part of the bot (docs/bot.md).
import { existsSync } from 'std/fs/exists.ts'
import { assert } from 'std/assert/assert.ts'
import { join } from 'std/path/join.ts'

import { describe } from './describe.ts'
import { event_schema, lineOf, type Logged, parseLog } from './events.ts'
import { fold, type World } from './fold.ts'

const botDir = () => {
  const dir = Deno.env.get('BOT_DIR')
  assert(dir, 'BOT_DIR is unset (bot/lib/bot.sh sets it)')
  return dir
}

const eventsFile = () => join(botDir(), 'events.jsonl')
export const LIMITS = { maxFailedRuns: Number(Deno.env.get('BOT_MAX_FAILED_RUNS') ?? 5) }

export const readLog = (): Logged[] => (existsSync(eventsFile()) ? parseLog(Deno.readTextFileSync(eventsFile())) : [])

export const loadWorld = (): World => fold(readLog(), LIMITS)

export const clock = (date = new Date()) => date.toTimeString().slice(0, 8)

/** Appends lines to a worktree's card.log as `HH:MM:SS <source> │ <line>`. */
export function cardLog(worktree: string, source: string, text: string, at = new Date()) {
  const lines = text.split('\n').map((line) => `${clock(at)} ${source} │ ${line}\n`)
  Deno.writeTextFileSync(join(worktree, '.vha', 'card.log'), lines.join(''), { append: true })
}

/**
 * Appends one event (its time stamped when absent), but only if the log stays one the fold accepts,
 * so a bad write can never wedge the bot; then logs it to its card's card.log.
 */
export function appendEvent(input: unknown): World {
  const line = lineOf(input, new Date())
  const events = readLog()
  const event = { ...event_schema.parse(JSON.parse(line)), id: events.length + 1 }
  const after = fold([...events, event], LIMITS)
  Deno.writeTextFileSync(eventsFile(), line, { append: true })
  const worktree = after.cards.get(event.card)?.worktree
  if (worktree && existsSync(join(worktree.path, '.vha'))) cardLog(worktree.path, 'event', describe(event))
  return after
}
