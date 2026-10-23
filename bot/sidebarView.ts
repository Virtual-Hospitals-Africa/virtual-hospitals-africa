// What the sidebar shows (docs/bot.md#the-sidebar): every live card, what is running on it and for
// how long, as lines of text and what a click on each does. Pure; bot/sidebar.ts draws it.
import { type Card, type CardState, requestOf, stateOf, statusOf, type World } from './fold.ts'

/**
 * Where a click on a card takes you: its running worker's window, its test's output, its card.log, or
 * a talk with its worker's session while nothing of the bot's runs on it.
 */
export type Target = { kind: 'worker' | 'test' | 'log' | 'talk'; card: string; worktree: string }

export type Span = { from: number; to: number; action: { kind: 'show'; target: Target } | { kind: 'notion'; url: string } }

/** One screen line: its text (with colors) and what clicking each part of it does. */
export type Line = { text: string; spans: Span[] }

/** The bot's own processes, from .bot/processes.json. */
export type Bot = { running: boolean; down: string[] }

const ESC = '\u001b'
const color = (code: string, text: string) => `${ESC}[${code}m${text}${ESC}[0m`
const DIM = '2'
const BOLD = '1'
const UNDERLINE = '4'
const STATE_COLORS: Record<CardState, string> = {
  Queued: DIM,
  Working: '32',
  Checking: '32',
  'Waiting on you': '33',
  'Queued for test run': '36',
  Testing: '36',
  'Awaiting CI': '36',
  Paused: DIM,
  Blocked: '31',
  Finished: '34',
  Gone: DIM,
}

/** A Notion URL from a card's id alone: Notion redirects it to the page. */
export const notionUrl = (card: string) => `https://www.notion.so/${card.replace(/-/g, '')}`

/** OSC 8: the text is a link a terminal opens on ⌘-click. */
const link = (url: string, text: string) => `${ESC}]8;;${url}${ESC}\\${text}${ESC}]8;;${ESC}\\`

/** 45s, 12m04s, 3h12m, 2d04h. */
export function elapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m${pad(s % 60)}s`
  if (s < 86_400) return `${Math.floor(s / 3600)}h${pad(Math.floor((s % 3600) / 60))}m`
  return `${Math.floor(s / 86_400)}d${pad(Math.floor((s % 86_400) / 3600))}h`
}

/** Cut to `width` characters, ending in … when it was longer. */
const fit = (text: string, width: number) => {
  const chars = [...text]
  return chars.length <= width ? text : `${chars.slice(0, Math.max(0, width - 1)).join('')}…`
}

/** What a click on the card shows, or null when it has no worktree to show anything from. */
export type Activity = { what: string; since: string; target: Target['kind'] | null }

/** Whether a worktree the log names is still on disk. */
export type OnDisk = (path: string) => boolean

/**
 * What is running on the card, and since when; or, since it last changed state, its worker session
 * to talk to, or why there is nothing to look at.
 */
export function activityOf(card: Card, world: World, onDisk: OnDisk): Activity {
  if (!card.worktree) return { what: 'no worktree yet', since: card.stateSince, target: null }
  if (!onDisk(card.worktree.path)) return { what: 'worktree gone', since: card.stateSince, target: null }
  if (card.worker && card.state === 'Checking') return { what: 'checks before the PR', since: card.stateSince, target: 'log' }
  if (card.worker && card.workerSince) return { what: `claude · turn ${card.turns}`, since: card.workerSince, target: 'worker' }
  if (card.tester && card.testerSince) {
    const request = requestOf(world, card.id, card.tester.request)
    return { what: `tester #${card.tester.tester} · ${request?.kind ?? 'test'}`, since: card.testerSince, target: 'test' }
  }
  if (card.session) return { what: 'worker', since: card.stateSince, target: 'talk' }
  return { what: 'idle', since: card.stateSince, target: 'log' }
}

const GROUPS: Partial<Record<CardState, number>> = { 'Waiting on you': 1, Blocked: 1, Finished: 3 }

/** Running cards first, then the ones waiting on a human, then the queue, then finished ones. */
const groupOf = (card: Card, state: CardState) => (card.worker || card.tester ? 0 : (GROUPS[state] ?? 2))

export function liveCards(world: World, now: Date): Card[] {
  return world.order
    .map((id) => world.cards.get(id))
    .filter((card): card is Card => card !== undefined && card.gone === null)
    .map((card, index) => ({ card, index, group: groupOf(card, stateOf(card, world, now)) }))
    .sort((a, b) => a.group - b.group || a.index - b.index)
    .map(({ card }) => card)
}

function headerLines(world: World, bot: Bot, now: Date, width: number): Line[] {
  const cards = liveCards(world, now)
  const working = cards.filter((card) => card.worker).length
  const testing = cards.filter((card) => card.tester).length
  const status = bot.running ? color('32', '● bot running') : color('31', '✘ bot stopped')
  const counts = color(DIM, ` · ${working} working · ${testing} testing`)
  const lines: Line[] = [{ text: ` ${status}${counts}`, spans: [] }]
  if (bot.down.length > 0) lines.push({ text: color('31', fit(` DOWN: ${bot.down.join(', ')}`, width)), spans: [] })
  if (world.pausedUntil && Date.parse(world.pausedUntil) > now.getTime()) {
    const until = new Date(world.pausedUntil).toTimeString().slice(0, 5)
    lines.push({ text: color('33', ` paused by a usage limit until ${until}`), spans: [] })
  }
  return lines
}

const NOTION_LABEL = 'notion ↗'

/** A card finished by its merged PR reads as its Status in Notion; every other as its state. */
function labelOf(card: Card, state: CardState): string {
  return (card.prMerged ? statusOf(card) : null) ?? state
}

function cardLines(card: Card, world: World, now: Date, width: number, onDisk: OnDisk): Line[] {
  const state = stateOf(card, world, now)
  const activity = activityOf(card, world, onDisk)
  const url = notionUrl(card.id)
  function spanOf(from: number, to: number, kind: Target['kind'] | null): Span[] {
    return kind && card.worktree ? [{ from, to, action: { kind: 'show', target: { kind, card: card.id, worktree: card.worktree.path } } }] : []
  }
  // The worker session is a link of its own; the rest of the card is its card.log.
  const card_target = activity.target === 'talk' ? 'log' : activity.target
  const title_width = width - NOTION_LABEL.length - 4
  const title = fit(card.title, title_width)
  const gap = ' '.repeat(Math.max(1, width - [...title].length - NOTION_LABEL.length - 3))
  const dot = card.worker || card.tester ? color(STATE_COLORS[state], '●') : color(DIM, '○')
  const notion_from = 3 + [...title].length + gap.length
  const before = `${labelOf(card, state)}${card.held ? ' · held' : ''} · `
  const after = ` · ${elapsed(now.getTime() - Date.parse(activity.since))}`
  const what = fit(activity.what, Math.max(1, width - 3 - [...before].length - [...after].length))
  const what_from = 3 + [...before].length
  const what_to = what_from + [...what].length
  const state_color = STATE_COLORS[state]
  const what_text = activity.target === 'talk' ? color(`${state_color};${UNDERLINE}`, what) : color(state_color, what)
  return [
    {
      text: ` ${dot} ${link(url, color(BOLD, title))}${gap}${link(url, color('34', NOTION_LABEL))}`,
      spans: [...spanOf(0, notion_from, card_target), { from: notion_from, to: width, action: { kind: 'notion', url } }],
    },
    {
      text: `   ${color(state_color, before)}${what_text}${color(state_color, after)}`,
      spans: [...spanOf(what_from, what_to, activity.target), ...spanOf(0, width, card_target)],
    },
    { text: '', spans: [] },
  ]
}

/** Every line of the sidebar, `width` columns wide. */
export function sidebarLines(world: World, bot: Bot, now: Date, width: number, onDisk: OnDisk): Line[] {
  const cards = liveCards(world, now)
  const body = cards.length === 0 ? [{ text: color(DIM, ' No cards.'), spans: [] }] : cards.flatMap((card) => cardLines(card, world, now, width, onDisk))
  return [...headerLines(world, bot, now, width), { text: '', spans: [] }, ...body]
}
