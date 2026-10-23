// The bot's state, for its bash processes and for humans (docs/bot.md). Reads .bot/events.jsonl.
//   state.ts emit '<event json>'           validate, append, and log it to the card's card.log
//   state.ts next worker|tester|notion     the next job as JSON; exit 1 when there is none
//   state.ts next worker --except <worktree>…   passing over cards a human is talking to
//   state.ts request <card> <id>           what a tester runs for that request
//   state.ts resume <card>                 the message for the worker's next turn
//   state.ts check-outcome <file> <worktree>  the outcome's kind, or why it is invalid (exit 1)
//   state.ts servers <command>             true when a test command needs the web servers, else false
//   state.ts card <name>                   one card as JSON (by id, hex id or branch)
//   state.ts gone | owned | live worker|tester   one JSON line per card (owned: with a worktree)
//   state.ts watched                       one JSON line per Blocked or Awaiting CI card with a worktree (and the seconds it has waited)
//   state.ts status [name]                 for humans
//   state.ts render                        events on stdin, one line each
import { existsSync } from 'std/fs/exists.ts'
import { assert } from 'std/assert/assert.ts'
import { basename } from 'std/path/basename.ts'
import { join } from 'std/path/join.ts'
import { TextLineStream } from 'std/streams/text_line_stream.ts'

import { describe } from './describe.ts'
import { appendEvent, clock, loadWorld as world, readLog } from './eventLog.ts'
import { type BotEvent, event_schema } from './events.ts'
import {
  type Card,
  type Comment,
  findCard,
  goneWork,
  isIdle,
  isPaused,
  liveCards,
  nextNotion,
  nextTester,
  nextWorker,
  ownedWorktrees,
  type Part,
  requestOf,
  type ResumeItem,
  stateOf,
  watchedBranches,
  type World,
} from './fold.ts'
import { writeOut } from './io.ts'
import { checkOutcome, needsServers, readOutcome } from './outcome.ts'

function cardNamed(w: World, name: string): Card {
  const card = findCard(w, name)
  assert(card, `no card known as ${name}`)
  return card
}

const print = (value: unknown) => writeOut(`${JSON.stringify(value)}\n`)

// ── files the fold points at ──────────────────────────────────────────────────────────────────────
function tailOf(file: string, lines: number): string {
  const text = existsSync(file) ? Deno.readTextFileSync(file).trimEnd().split('\n').slice(-lines).join('\n') : ''
  return `Last lines of ${basename(file)}:\n\n\`\`\`\n${text}\n\`\`\``
}

const logTail = (runDir: string, lines: number) => tailOf(join(runDir, 'command.log'), lines)

function partText(part: Part): string {
  if ('text' in part) return part.text
  const outcome = readOutcome(part.file)
  if (part.field === 'comment' && outcome.kind === 'ask') return outcome.comment
  if (part.field === 'reason' && outcome.kind === 'blocked') return outcome.reason
  if (part.field === 'summary' && outcome.kind === 'done') return outcome.summary
  throw new Error(`${part.file} is a ${outcome.kind} outcome; it has no ${part.field}`)
}

type Reply = { author: string; created: string; text: string; files: { name: string; url: string }[] }

function repliesText(file: string): string {
  const replies: Reply[] = JSON.parse(Deno.readTextFileSync(file))
  return replies
    .map(
      (r) => `**${r.author}** (${r.created}):\n${r.text}${r.files.length > 0 ? `\nAttached: ${r.files.map((f) => f.url).join(', ')}` : ''}`,
    )
    .join('\n\n')
}

/** A merge of origin/main the turn is owed is made, and told, by bot/claude-worker.sh. */
type ResumeText = Exclude<ResumeItem, { kind: 'merge-main' }>

function resumeText(item: ResumeText): string {
  switch (item.kind) {
    case 'replies':
      return `New replies on the card:\n\n${repliesText(item.file)}`
    case 'talked':
      return 'A human talked to you in this session since your last turn ended. Treat what they said there as their replies, and carry on from where the talk left off.'
    case 'run':
      if (item.runDir === null) {
        return `Your run stopped before it started (${item.failure ?? `exit ${item.exitCode}`}). Check the command, then continue.`
      }
      return [
        `Your run finished with exit code ${item.exitCode}${item.exitCode !== 0 && item.failure ? ` (${item.failure})` : ''}.`,
        `Run dir: ${item.runDir} (command.log; for a web run also server.log, proxy.log and events.log, the servers' own)`,
        logTail(item.runDir, 60),
      ].join('\n\n')
    case 'checks-failed':
      return [
        `The checks before your PR failed: ${item.failure}.`,
        item.log ? `Log: ${item.log}\n\n${tailOf(item.log, 80)}` : '',
        'Fix it, commit, and end with a new "done" outcome.',
      ]
        .filter(Boolean)
        .join('\n\n')
    case 'ci-failed':
      return [
        `CI failed on your PR: ${item.failure}.`,
        'Fix it, commit, and end with a new "done" outcome, which updates the same PR.',
      ].join('\n\n')
    case 'pr-failed':
      return `Your checks passed, but pushing the branch or opening its PR failed: ${item.error}. Unless that error names your change, end with the same "done" outcome again.`
    case 'conflict':
      return 'Merging origin/main into your branch conflicted. Merge it and resolve the conflicts, then continue.'
    case 'interrupted':
      return 'The bot restarted while you were working; check your worktree state and continue.'
    case 'unblocked':
      return [
        'A human set this card back to Queued after you blocked it.',
        item.reason ? `You had blocked with:\n\n${partText(item.reason)}` : '',
        'Treat what you asked for as done unless their replies say otherwise, and continue — re-request a run if you need one.',
      ]
        .filter(Boolean)
        .join('\n\n')
    case 'usage':
      return 'You were paused by a usage limit; continue.'
    case 'bad-outcome':
      return `Your last turn ended without a valid outcome: ${item.detail}. Write .vha/outcome.json and stop.`
    case 'overran':
      return 'You were stopped for running too long; wrap up and report with .vha/outcome.json.'
  }
}

function resume(name: string) {
  const card = cardNamed(world(), name)
  const parts = card.delivered.flatMap((item) => (item.kind === 'merge-main' ? [] : [resumeText(item)]))
  parts.push('Continue. End the turn with .vha/outcome.json as before.')
  writeOut(`${parts.join('\n\n')}\n`)
}

function attachments(comment: Comment, worktree: string | null): string[] {
  if (comment.attach === null) return []
  const outcome = readOutcome(comment.attach.outcome)
  if (outcome.kind !== 'ask' || !outcome.attachments) return []
  assert(worktree, 'an ask outcome with attachments needs its worktree')
  return outcome.attachments.map((path) => join(worktree, path))
}

// ── jobs ──────────────────────────────────────────────────────────────────────────────────────────
function next(kind: string, args: string[]) {
  const w = world()
  const now = new Date()
  if (kind === 'worker') {
    const talking: string[] = []
    for (let i = 0; i < args.length; i += 2) {
      const [flag, worktree] = [args[i], args[i + 1]]
      assert(flag === '--except' && worktree, `next worker: --except <worktree>… (not ${args.join(' ')})`)
      talking.push(worktree)
    }
    const job = nextWorker(w, now, new Set(talking))
    if (job) print(job)
    return job !== null
  }
  if (kind === 'tester') {
    const job = nextTester(w)
    if (job) print({ card: job.card, request: job.request.id, kind: job.request.kind, worktree: job.worktree.path })
    return job !== null
  }
  assert(kind === 'notion', `next: worker, tester or notion (not ${kind})`)
  const job = nextNotion(w, now)
  if (!job) return false
  if (job.kind === 'set') {
    print({ ...job, ack: { type: 'notion.wrote', card: job.card, fields: job.fields } })
  } else {
    print({
      kind: 'comment',
      card: job.card,
      text: job.comment.parts.map(partText).join(''),
      attach: attachments(job.comment, job.worktree),
      ack: { type: 'notion.commented', card: job.card, for: job.comment.for },
    })
  }
  return true
}

function request(name: string, id: number) {
  const w = world()
  const card = cardNamed(w, name)
  const found = requestOf(w, card.id, id)
  assert(found, `request ${id} is not pending for ${card.id}`)
  if (found.kind === 'hand') {
    print({ kind: 'hand', servers: found.servers, command: found.command })
    return
  }
  const outcome = readOutcome(found.file)
  assert(outcome.kind === 'run', `request ${id} is a ${outcome.kind} outcome`)
  print({ kind: 'run', servers: needsServers(outcome.command, outcome.servers), command: outcome.command })
}

const summary = (card: Card, w: World) => ({
  id: card.id,
  title: card.title,
  state: stateOf(card, w, new Date()),
  held: card.held,
  worktree: card.worktree,
  session: card.session,
  worker: card.worker,
  tester: card.tester,
  pr: card.pr,
  streaks: card.streaks,
  block: card.block ? partText(card.block) : null,
  idle: isIdle(card),
  mergeMainDelivered: card.delivered.some((item) => item.kind === 'merge-main'),
})

// ── status ────────────────────────────────────────────────────────────────────────────────────────
function status(name: string | undefined) {
  const w = world()
  const now = new Date()
  const cards = name ? [cardNamed(w, name)] : [...w.cards.values()].filter((card) => !card.gone || card.worktree)
  if (isPaused(w, now)) console.log(`Paused by a usage limit until ${w.pausedUntil}`)
  const lag = nextNotion(w, now)
  console.log(lag ? `Notion is behind (next write: ${lag.kind} for ${lag.card})` : 'Notion is up to date')
  if (cards.length === 0) console.log('\nNo cards.')
  for (const card of cards) {
    const running = card.worker ? 'worker running' : card.tester ? `tester #${card.tester.tester} running` : 'idle'
    console.log(`\n● ${card.title}  (${card.id})`)
    console.log(`  ${stateOf(card, w, now)}${card.held ? ' · held' : ''} · ${running}`)
    if (card.worktree) console.log(`  worktree: ${card.worktree.path}`)
    if (card.session) console.log(`  session:  ${card.session}`)
    if (card.pr) console.log(`  PR:       ${card.pr}`)
    const counts = Object.entries<number>(card.streaks).filter(([, n]) => n > 0)
    if (counts.length > 0) console.log(`  retries:  ${counts.map(([k, n]) => `${k} ${n}`).join(', ')}`)
    if (card.block) console.log(`  blocked:  ${partText(card.block).split('\n')[0]}`)
  }
}

// ── render ────────────────────────────────────────────────────────────────────────────────────────
async function render() {
  const names = new Map<string, string>()
  const nameOf = (event: BotEvent) => names.get(event.card) ?? event.card.slice(0, 8)
  for (const event of readLog()) {
    if (event.type === 'card.admitted') names.set(event.card, event.title.slice(0, 30))
  }
  for await (const line of Deno.stdin.readable.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream())) {
    if (line.trim() === '') continue
    const event = event_schema.parse(JSON.parse(line))
    if (event.type === 'card.admitted') names.set(event.card, event.title.slice(0, 30))
    console.log(`${clock(new Date(event.ts))} ${nameOf(event)} │ ${describe(event)}`)
  }
}

// ── main ──────────────────────────────────────────────────────────────────────────────────────────
async function main(): Promise<number> {
  const [command, ...args] = Deno.args
  switch (command) {
    case 'emit':
      assert(args[0], 'emit: an event is required')
      appendEvent(JSON.parse(args[0]))
      return 0
    case 'next':
      return next(args[0] ?? '', args.slice(1)) ? 0 : 1
    case 'request':
      assert(args[0] && args[1], 'request: <card> <id>')
      request(args[0], Number(args[1]))
      return 0
    case 'resume':
      assert(args[0], 'resume: a card is required')
      resume(args[0])
      return 0
    case 'check-outcome': {
      assert(args[0] && args[1], 'check-outcome: <file> <worktree>')
      const checked = checkOutcome(args[0], args[1])
      console.log(checked.ok ? checked.outcome.kind : checked.why)
      return checked.ok ? 0 : 1
    }
    case 'card': {
      assert(args[0], 'card: a name is required')
      const w = world()
      const card = findCard(w, args[0])
      if (!card) return 1
      print(summary(card, w))
      return 0
    }
    case 'gone':
      goneWork(world()).forEach((item) => print(item))
      return 0
    case 'owned':
      ownedWorktrees(world()).forEach((item) => print(item))
      return 0
    case 'servers':
      assert(args[0], 'servers: a command is required')
      console.log(needsServers(args[0]))
      return 0
    case 'watched':
      watchedBranches(world()).forEach(({ since, ...item }) => print({ ...item, waited: Math.floor((Date.now() - Date.parse(since)) / 1000) }))
      return 0
    case 'live':
      assert(args[0] === 'worker' || args[0] === 'tester', 'live: worker or tester')
      liveCards(world(), args[0]).forEach((item) => print(item))
      return 0
    case 'status':
      status(args[0])
      return 0
    case 'render':
      await render()
      return 0
    default:
      throw new Error(`usage: state.ts emit | next | request | resume | check-outcome | servers | card | gone | owned | watched | live | status | render`)
  }
}

main().then(
  (code) => Deno.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    Deno.exit(2)
  },
)
