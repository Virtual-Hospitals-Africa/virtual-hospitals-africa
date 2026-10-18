// The bot's state machine (docs/bot.md#how-it-works): a pure fold from the event log to where every
// card stands, and the questions the supervisors ask of it. No I/O here; bot/state.ts does that.
import { assert } from 'std/assert/assert.ts'

import type { EventOf, Logged } from './events.ts'

export type BotState =
  | 'Queued'
  | 'Working'
  | 'Checking'
  | 'Waiting on you'
  | 'Queued for test run'
  | 'Testing'
  | 'Awaiting CI'
  | 'Paused'
  | 'Blocked'
  | 'Finished'
export type CardState = BotState | 'Gone'
/** What Notion's Bot state shows: the checks before the PR read as Working. */
export type NotionBotState = Exclude<BotState, 'Checking'>
export type Priority = 'High' | 'Medium' | 'Low' | null

export type Worktree = { path: string; branch: string; portIndex: number }

/** Text to post, or a field of a worker's outcome file to read it from. */
export type Part = { text: string } | { file: string; field: 'comment' | 'reason' | 'summary' }

export type Comment = {
  for: number
  parts: Part[]
  attach: { outcome: string } | null
}

/** A test the card is waiting for: a worker's run outcome, or a human's hand run. */
export type Request = { id: number; kind: 'run'; file: string } | { id: number; kind: 'hand'; command: string; servers: boolean }

/** What the worker's next turn is told about. */
export type ResumeItem =
  | { kind: 'replies'; file: string }
  | { kind: 'talked' }
  | { kind: 'run'; runDir: string | null; exitCode: number; failure: string | null }
  | { kind: 'checks-failed'; log: string | null; failure: string }
  | { kind: 'ci-failed'; failure: string }
  | { kind: 'pr-failed'; error: string }
  | { kind: 'conflict' }
  | { kind: 'merge-main' }
  | { kind: 'interrupted' }
  | { kind: 'unblocked'; reason: Part | null }
  | { kind: 'usage' }
  | { kind: 'bad-outcome'; detail: string }
  | { kind: 'overran' }

export type Streaks = {
  failedRuns: number
  failedDones: number
  badOutcomes: number
  overruns: number
  prFailures: number
  worktreeFailures: number
}

export type Fields = Record<string, string | boolean | null>

export type Card = {
  id: string
  title: string
  priority: Priority
  created: string
  state: CardState
  /** When it last changed state. */
  stateSince: string
  held: boolean
  gone: 'notion' | 'kill' | 'done' | null
  worktree: Worktree | null
  session: string | null
  /** When its first worker started: comments before then were in that worker's start prompt. */
  startedAt: string | null
  pr: string | null
  /** Its branch's PR was merged while it was Blocked (bot/gh-reader.sh): finished by hand. */
  prMerged: boolean
  lastComment: string | null
  seenComments: Set<string>
  block: Part | null
  worker: boolean
  /** When the running worker turn (or the checks after it) started. */
  workerSince: string | null
  /** How many worker turns it has had. */
  turns: number
  tester: { request: number; tester: number } | null
  /** When the running test started. */
  testerSince: string | null
  pending: Request | null
  /** A done whose checks are running: its outcome file and the event that started them. */
  checking: { id: number; file: string } | null
  hand: Request[]
  streaks: Streaks
  lastWorktreeFailure: string | null
  inbox: ResumeItem[]
  delivered: ResumeItem[]
  written: Fields
  comments: Comment[]
  commented: Set<number>
}

export type World = { cards: Map<string, Card>; order: string[]; pausedUntil: string | null }

export type Limits = { maxFailedRuns: number }

const DONE_LIMIT = 3
const BAD_OUTCOME_LIMIT = 2
const OVERRUN_LIMIT = 2
const PR_LIMIT = 3
const WORKTREE_LIMIT = 3
/** A failed worktree is not retried sooner than this, so a network blip does not burn all three tries. */
export const WORKTREE_RETRY_MS = 60_000

const NO_STREAKS: Streaks = {
  failedRuns: 0,
  failedDones: 0,
  badOutcomes: 0,
  overruns: 0,
  prFailures: 0,
  worktreeFailures: 0,
}

function admitted(event: EventOf<'card.admitted'>, before: Card | undefined): Card {
  return {
    id: event.card,
    title: event.title,
    priority: event.priority,
    created: event.created,
    state: 'Queued',
    stateSince: event.ts,
    held: false,
    gone: null,
    worktree: null,
    session: null,
    startedAt: null,
    pr: null,
    prMerged: false,
    lastComment: before?.lastComment ?? null,
    seenComments: before?.seenComments ?? new Set(),
    block: null,
    worker: false,
    workerSince: null,
    turns: 0,
    tester: null,
    testerSince: null,
    pending: null,
    checking: null,
    hand: [],
    streaks: { ...NO_STREAKS },
    lastWorktreeFailure: null,
    inbox: [],
    delivered: [],
    written: before?.written ?? {},
    comments: before?.comments ?? [],
    commented: before?.commented ?? new Set(),
  }
}

class FoldError extends Error {
  constructor(event: Logged, why: string) {
    super(`events.jsonl line ${event.id} (${event.type} for ${event.card}): ${why}`)
  }
}

function expectState(card: Card, event: Logged, ...states: CardState[]) {
  if (!states.includes(card.state)) {
    throw new FoldError(event, `the card is ${card.state}, not ${states.join(' or ')}`)
  }
}

/** Blocks the card with a reason, which is also posted to it. */
function block(card: Card, event: Logged, reason: Part) {
  card.state = 'Blocked'
  card.block = reason
  card.pending = null
  card.comments.push({ for: event.id, parts: [{ text: '**Blocked:** ' }, reason], attach: null })
}

const failureText = (failure: string | null, exitCode: number) => failure ?? `exit ${exitCode}`

/** Why a card is blocked for want of a database dump, and what a human does about it. */
const resourceBlock = (resource: 'dump_missing' | 'dump_stale', error: string) =>
  resource === 'dump_missing'
    ? `the card's databases cannot be made: ${error}. A human must make the dump (deno task docker db:rebuild && deno task docker db:dump > ./db/dumps/latest, in the bot's checkout), then set Bot state to Queued.`
    : `the card's databases cannot be made from a stale dump: ${error}. A human must refresh it (deno task docker db:rebuild && deno task docker db:dump > ./db/dumps/latest, in the bot's checkout), then set Bot state to Queued.`

/** Applies one event to the card it names. Events for a Gone card only settle its bookkeeping. */
function apply(world: World, event: Logged, limits: Limits) {
  if (event.type === 'card.admitted') {
    const before = world.cards.get(event.card)
    if (before && !(before.gone && before.worktree === null)) {
      throw new FoldError(event, 'the card is already the bot’s')
    }
    if (!before) world.order.push(event.card)
    world.cards.set(event.card, admitted(event, before))
    return
  }
  const card = world.cards.get(event.card)
  if (!card) throw new FoldError(event, 'no card.admitted came before it')
  const live = card.gone === null

  switch (event.type) {
    case 'card.reprioritized':
      card.priority = event.priority
      return
    case 'card.replied':
      event.commentIds.forEach((id) => card.seenComments.add(id))
      card.lastComment = event.newest
      card.inbox.push({ kind: 'replies', file: event.file })
      if (card.state === 'Waiting on you') card.state = 'Queued'
      return
    case 'card.talked':
      if (!live) return
      card.inbox.push({ kind: 'talked' })
      if (card.state === 'Waiting on you') card.state = 'Queued'
      return
    case 'card.unblocked':
      expectState(card, event, 'Blocked')
      card.state = 'Queued'
      card.streaks = { ...NO_STREAKS }
      card.lastWorktreeFailure = null
      card.inbox = [
        ...card.inbox.filter((item) => item.kind === 'replies' || item.kind === 'talked' || item.kind === 'merge-main'),
        { kind: 'unblocked', reason: card.block },
      ]
      card.block = null
      return
    case 'card.held':
      card.held = true
      return
    case 'card.released':
      card.held = false
      return
    case 'card.withdrawn':
      card.state = 'Gone'
      card.gone = event.by
      return
    case 'card.done':
      card.state = 'Gone'
      card.gone = 'done'
      return

    case 'worktree.created':
      card.worktree = { path: event.path, branch: event.branch, portIndex: event.portIndex }
      card.streaks.worktreeFailures = 0
      return
    case 'worktree.failed':
      card.streaks.worktreeFailures += 1
      card.lastWorktreeFailure = event.ts
      if (live && event.resource) {
        // Retrying cannot make a dump: a human has to, then unblock the card.
        block(card, event, { text: resourceBlock(event.resource, event.error) })
      } else if (live && card.streaks.worktreeFailures >= WORKTREE_LIMIT) {
        block(card, event, { text: `creating the worktree failed ${WORKTREE_LIMIT} times (last: ${event.error}).` })
      }
      return
    case 'worktree.removed':
      card.worktree = null
      return
    case 'worktree.unmerged':
      if (live && !card.inbox.some((item) => item.kind === 'merge-main')) card.inbox.push({ kind: 'merge-main' })
      return

    case 'worker.launched':
      expectState(card, event, 'Queued', 'Paused')
      card.state = 'Working'
      card.worker = true
      card.turns += 1
      card.startedAt ??= event.ts
      card.delivered = card.inbox
      card.inbox = []
      return
    case 'worker.session':
      card.session = event.session
      return
    case 'worker.outcome':
      card.worker = false
      if (!live) return
      expectState(card, event, 'Working')
      card.streaks.badOutcomes = 0
      card.streaks.overruns = 0
      if (event.kind === 'ask') {
        card.state = 'Waiting on you'
        card.comments.push({ for: event.id, parts: [{ file: event.file, field: 'comment' }], attach: { outcome: event.file } })
      } else if (event.kind === 'blocked') {
        block(card, event, { file: event.file, field: 'reason' })
      } else {
        card.state = 'Queued for test run'
        card.pending = { id: event.id, kind: 'run', file: event.file }
      }
      return
    case 'worker.failed':
      card.worker = false
      if (!live) return
      expectState(card, event, 'Working')
      if (event.why === 'overran') {
        card.streaks.overruns += 1
        if (card.streaks.overruns >= OVERRUN_LIMIT) {
          block(card, event, { text: `the worker ran past its time cap ${OVERRUN_LIMIT} times.` })
          return
        }
        card.inbox.push({ kind: 'overran' })
      } else {
        card.streaks.badOutcomes += 1
        if (card.streaks.badOutcomes >= BAD_OUTCOME_LIMIT) {
          block(card, event, {
            text: `the worker ended ${BAD_OUTCOME_LIMIT} turns in a row without a valid outcome (${event.detail}).`,
          })
          return
        }
        card.inbox.push({ kind: 'bad-outcome', detail: event.detail })
      }
      card.state = 'Queued'
      return
    case 'worker.usage_limited':
      card.worker = false
      if (world.pausedUntil === null || event.until > world.pausedUntil) world.pausedUntil = event.until
      if (!live) return
      expectState(card, event, 'Working')
      card.state = 'Paused'
      card.inbox.push({ kind: 'usage' })
      return
    case 'worker.interrupted':
      card.worker = false
      card.checking = null
      if (card.state === 'Working' || card.state === 'Checking') {
        card.state = 'Queued'
        card.inbox.push({ kind: 'interrupted' })
      }
      return
    case 'checks.started':
      if (!live) return
      expectState(card, event, 'Working')
      card.streaks.badOutcomes = 0
      card.streaks.overruns = 0
      card.state = 'Checking'
      card.checking = { id: event.id, file: event.file }
      return
    case 'checks.failed':
      card.worker = false
      card.checking = null
      if (!live) return
      expectState(card, event, 'Checking')
      settleChecks(card, event)
      return

    case 'test.requested':
      card.hand.push({ id: event.id, kind: 'hand', command: event.command, servers: event.servers })
      return
    case 'test.launched':
      card.tester = { request: event.request, tester: event.tester }
      if (card.pending?.id === event.request) {
        expectState(card, event, 'Queued for test run')
        card.state = 'Testing'
      } else if (!card.hand.some((h) => h.id === event.request)) {
        throw new FoldError(event, `request ${event.request} is not pending`)
      }
      return
    case 'test.interrupted':
      card.tester = null
      if (card.pending?.id === event.request && card.state === 'Testing') card.state = 'Queued for test run'
      return
    case 'test.conflicted':
    case 'test.refused':
    case 'test.finished':
      card.tester = null
      if (card.pending?.id !== event.request) {
        card.hand = card.hand.filter((h) => h.id !== event.request)
        return
      }
      if (!live) return
      settleTest(card, event, limits)
      return
    case 'pr.pushed': {
      const { checking } = card
      card.worker = false
      card.checking = null
      if (!live) return
      expectState(card, event, 'Checking')
      if (!checking) throw new FoldError(event, 'no checks.started came before it')
      card.comments.push({
        for: event.id,
        parts: [
          { text: `**PR ${card.pr ? 'updated' : 'opened'}:** ${event.url}. Waiting for CI.\n\n` },
          { file: checking.file, field: 'summary' },
        ],
        attach: null,
      })
      card.pr = event.url
      card.streaks.prFailures = 0
      card.state = 'Awaiting CI'
      return
    }
    case 'ci.passed':
      if (!live) return
      expectState(card, event, 'Awaiting CI')
      card.streaks.failedDones = 0
      card.state = 'Finished'
      card.comments.push({
        for: event.id,
        parts: [{ text: `**CI passed** on ${event.sha.slice(0, 8)}: ${event.url} is ready for review.` }],
        attach: null,
      })
      return
    case 'ci.failed':
      if (!live) return
      expectState(card, event, 'Awaiting CI')
      card.streaks.failedDones += 1
      if (card.streaks.failedDones >= DONE_LIMIT) {
        block(card, event, { text: `verification failed ${DONE_LIMIT} times in a row (last: CI ${event.failure}).` })
        return
      }
      card.inbox.push({ kind: 'ci-failed', failure: event.failure })
      card.state = 'Queued'
      card.comments.push({
        for: event.id,
        parts: [{ text: `**CI failed** on ${event.sha.slice(0, 8)}: ${event.failure}. Sent back to the worker to fix.` }],
        attach: null,
      })
      return
    case 'pr.merged':
      if (!live) return
      expectState(card, event, 'Blocked', 'Awaiting CI')
      card.state = 'Finished'
      card.pr = event.url
      card.prMerged = true
      card.block = null
      card.pending = null
      card.comments.push({ for: event.id, parts: [{ text: `**PR merged:** ${event.url}. The bot has finished this card.` }], attach: null })
      return
    case 'pr.failed':
      // Only a done's checks open a PR, so only they can fail to.
      card.checking = null
      card.worker = false
      if (!live) return
      expectState(card, event, 'Checking')
      card.streaks.prFailures += 1
      if (card.streaks.prFailures >= PR_LIMIT) {
        block(card, event, { text: `pushing the branch or opening the PR failed ${PR_LIMIT} times (last: ${event.error}).` })
        return
      }
      card.state = 'Queued'
      card.inbox.push({ kind: 'pr-failed', error: event.error })
      return

    case 'notion.wrote':
      Object.assign(card.written, event.fields)
      return
    case 'notion.commented':
      card.commented.add(event.for)
      return
  }
}

type TestEnd = Extract<Logged, { type: 'test.conflicted' | 'test.refused' | 'test.finished' }>

/** The end of a worker's run request. */
function settleTest(card: Card, event: TestEnd, limits: Limits) {
  if (event.type === 'test.conflicted') {
    card.pending = null
    card.state = 'Queued'
    card.inbox.push({ kind: 'conflict' })
    return
  }
  if (event.type === 'test.refused') {
    block(card, event, {
      text: `this branch changes protected paths (${event.files.join(', ')}); a human must make that change.`,
    })
    return
  }
  const failed = event.exitCode !== 0
  const failure = failureText(event.failure, event.exitCode)
  card.pending = null
  card.inbox.push({ kind: 'run', runDir: event.runDir, exitCode: event.exitCode, failure: event.failure })
  card.state = 'Queued'
  if (!failed) {
    card.streaks.failedRuns = 0
    return
  }
  card.streaks.failedRuns += 1
  if (card.streaks.failedRuns >= limits.maxFailedRuns) {
    block(card, event, { text: `the worker's test runs failed ${limits.maxFailedRuns} times in a row (last: ${failure}).` })
    return
  }
  card.comments.push({
    for: event.id,
    parts: [{ text: `**Test run failed:** ${failure}. Sent back to the worker to fix.` }],
    attach: null,
  })
}

/** The end of a done's checks that did not reach a PR. */
function settleChecks(card: Card, event: Extract<Logged, { type: 'checks.failed' }>) {
  if (event.result === 'refused') {
    block(card, event, {
      text: `this branch changes protected paths (${event.files.join(', ')}); a human must make that change.`,
    })
    return
  }
  card.state = 'Queued'
  if (event.result === 'conflicted') {
    card.inbox.push({ kind: 'conflict' })
    return
  }
  card.streaks.failedDones += 1
  if (card.streaks.failedDones >= DONE_LIMIT) {
    block(card, event, { text: `verification failed ${DONE_LIMIT} times in a row (last: ${event.failure}).` })
    return
  }
  card.inbox.push({ kind: 'checks-failed', log: event.log, failure: event.failure })
  card.comments.push({
    for: event.id,
    parts: [{ text: `**Checks before the PR failed:** ${event.failure}. Sent back to the worker to fix.` }],
    attach: null,
  })
}

/** Stamps when the event changed what the card is doing: its state, its worker, its tester. */
function stamp(card: Card, before: CardState | undefined, event: Logged) {
  if (card.state !== before) card.stateSince = event.ts
  card.workerSince = card.worker ? (card.workerSince ?? event.ts) : null
  card.testerSince = card.tester ? (card.testerSince ?? event.ts) : null
}

export function fold(events: Logged[], limits: Limits): World {
  const world: World = { cards: new Map(), order: [], pausedUntil: null }
  for (const event of events) {
    const before = event.type === 'card.admitted' ? undefined : world.cards.get(event.card)?.state
    apply(world, event, limits)
    const card = world.cards.get(event.card)
    assert(card, `card ${event.card} is not in the world after its event`)
    stamp(card, before, event)
  }
  return world
}

export const isPaused = (world: World, now: Date) => world.pausedUntil !== null && Date.parse(world.pausedUntil) > now.getTime()

/** The card's state as Notion should show it: a Paused card is Queued again once the pause is over. */
export function stateOf(card: Card, world: World, now: Date): CardState {
  return card.state === 'Paused' && !isPaused(world, now) ? 'Queued' : card.state
}

const RANKS: Record<string, number> = { High: 0, Medium: 1, Low: 2 }
const rank = (priority: Priority) => (priority === null ? 3 : RANKS[priority])

export type WorkerJob = { card: string; title: string; worktree: Worktree | null; session: string | null }

/**
 * The Queued card to start or resume next: highest priority, then oldest. Cards whose worktree is in
 * `talking` are passed over: a human is talking to their worker session.
 */
export function nextWorker(world: World, now: Date, talking: ReadonlySet<string> = new Set()): WorkerJob | null {
  if (isPaused(world, now)) return null
  const ready = [...world.cards.values()]
    .filter((card) => stateOf(card, world, now) === 'Queued' && !card.held && !card.worker)
    .filter((card) => !(card.worktree && talking.has(card.worktree.path)))
    .filter(
      (card) =>
        card.worktree !== null ||
        card.lastWorktreeFailure === null ||
        now.getTime() - Date.parse(card.lastWorktreeFailure) >= WORKTREE_RETRY_MS,
    )
    .sort((a, b) => rank(a.priority) - rank(b.priority) || a.created.localeCompare(b.created))
  const card = ready[0]
  return card ? { card: card.id, title: card.title, worktree: card.worktree, session: card.session } : null
}

/** Whether a human may test the card by hand: nothing of the bot's is running or about to. */
export const isIdle = (card: Card) =>
  !card.worker &&
  !card.tester &&
  (card.held || ['Waiting on you', 'Blocked', 'Finished', 'Paused'].includes(card.state))

export type TesterJob = { card: string; request: Request; worktree: Worktree }

/** The longest-waiting test: a worker's run, or a human's hand run on an idle card. */
export function nextTester(world: World): TesterJob | null {
  const waiting: TesterJob[] = []
  for (const card of world.cards.values()) {
    const { worktree } = card
    if (card.gone || card.tester || !worktree) continue
    if (card.state === 'Queued for test run' && card.pending && !card.held) {
      waiting.push({ card: card.id, request: card.pending, worktree })
    }
    if (isIdle(card)) card.hand.forEach((request) => waiting.push({ card: card.id, request, worktree }))
  }
  waiting.sort((a, b) => a.request.id - b.request.id)
  return waiting[0] ?? null
}

/** The request a test ran for, wherever the card has got to since. */
export function requestOf(world: World, card: string, id: number): Request | null {
  const found = world.cards.get(card)
  if (!found) return null
  if (found.pending?.id === id) return found.pending
  return found.hand.find((h) => h.id === id) ?? null
}

/** The card's Bot state as Notion shows it (NotionBotState). */
export function notionStateOf(card: Card, world: World, now: Date): NotionBotState | 'Gone' {
  const state = stateOf(card, world, now)
  if (state === 'Checking') return 'Working'
  return state
}

/** The Status the card should have in Notion, or null while it is not the bot's to set. */
export function statusOf(card: Card): 'QA' | 'In progress' | null {
  if (card.state === 'Finished') return 'QA'
  return card.startedAt ? 'In progress' : null
}

/** What Notion should show for the card. Fields left out are not the bot's to change. */
export function desiredFields(card: Card, world: World, now: Date): Fields {
  const fields: Fields = {}
  if (card.gone === null) {
    fields['Bot state'] = notionStateOf(card, world, now)
    const status = statusOf(card)
    if (status) fields.Status = status
    if (card.session) fields['Bot session'] = card.session
    if (card.pr) fields.PR = card.pr
  }
  if (card.worktree) fields.Worktree = card.worktree.branch
  else if (typeof card.written.Worktree === 'string') fields.Worktree = null
  if (card.lastComment) fields['Last comment'] = card.lastComment
  if (card.gone === 'kill') fields.Bot = false
  return fields
}

export type NotionJob =
  | { kind: 'set'; card: string; fields: Fields }
  | { kind: 'comment'; card: string; comment: Comment; worktree: string | null }

/** Every card, in the order the bot first admitted it. */
function inOrder(world: World): Card[] {
  return world.order.map((id) => {
    const card = world.cards.get(id)
    assert(card, `card ${id} is in the order but not the map`)
    return card
  })
}

/** The first write Notion lacks: a card's changed fields, else the oldest unposted comment. */
export function nextNotion(world: World, now: Date): NotionJob | null {
  const cards = inOrder(world)
  for (const card of cards) {
    const desired = desiredFields(card, world, now)
    const changed = Object.entries(desired).filter(([field, value]) => card.written[field] !== value)
    if (changed.length > 0) return { kind: 'set', card: card.id, fields: Object.fromEntries(changed) }
  }
  const unposted = cards
    .flatMap((card) => card.comments.filter((c) => !card.commented.has(c.for)).map((comment) => ({ card, comment })))
    .sort((a, b) => a.comment.for - b.comment.for)[0]
  if (!unposted) return null
  const { card, comment } = unposted
  return { kind: 'comment', card: card.id, comment, worktree: card.worktree?.path ?? null }
}

/** Cards withdrawn or done that still have a running child or a worktree to clean up. */
export function goneWork(world: World) {
  return [...world.cards.values()]
    .filter((card) => card.gone && (card.worker || card.tester || card.worktree))
    .map((card) => ({
      card: card.id,
      by: card.gone,
      worker: card.worker,
      tester: card.tester !== null,
      worktree: card.worktree,
    }))
}

/** Every card, live or gone, that still has a worktree: the ones whose databases are not leftovers. */
export const ownedWorktrees = (world: World) =>
  [...world.cards.values()].flatMap((card) => (card.worktree ? [{ card: card.id, path: card.worktree.path }] : []))

/**
 * The cards with a worktree that bot/gh-reader.sh looks at on GitHub: a Blocked card's branch for a
 * merged PR, and an Awaiting CI card's PR for its checks (and a merge) too.
 */
export const watchedBranches = (world: World) =>
  [...world.cards.values()]
    .filter((card) => card.gone === null && (card.state === 'Blocked' || card.state === 'Awaiting CI'))
    .flatMap(({ id, worktree, state, stateSince, pr }) =>
      worktree ? [{ card: id, state, since: stateSince, path: worktree.path, branch: worktree.branch, pr }] : []
    )

/** Cards the log says have a running worker or tester. */
export const liveCards = (world: World, kind: 'worker' | 'tester') =>
  [...world.cards.values()]
    .filter((card) => (kind === 'worker' ? card.worker : card.tester !== null))
    .map((card) => ({ card: card.id, worktree: card.worktree, request: card.tester?.request ?? null }))

/** The card a human names by its dashed id, its 32-hex id, or its worktree's branch name. */
export function findCard(world: World, name: string): Card | null {
  const hex = name.replace(/-/g, '').toLowerCase()
  for (const card of world.cards.values()) {
    if (card.id === name || card.id.replace(/-/g, '') === hex) return card
    if (card.worktree && (card.worktree.branch === name || card.worktree.path === name)) return card
  }
  return null
}
