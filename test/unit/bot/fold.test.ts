import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatch } from 'std/assert/assert_match.ts'
import { assertStringIncludes } from 'std/assert/assert_string_includes.ts'
import { assertThrows } from 'std/assert/assert_throws.ts'

import { parseLog } from '../../../bot/events.ts'
import {
  desiredFields,
  findCard,
  fold,
  goneWork,
  isIdle,
  nextNotion,
  nextTester,
  nextWorker,
  type Part,
  type ResumeItem,
  stateOf,
  watchedBranches,
  WORKTREE_RETRY_MS,
  type World,
} from '../../../bot/fold.ts'
import { assertMatches } from '../../../util/assertMatches.ts'

function assertThrowsMatching(fn: () => unknown, pattern: RegExp) {
  const error = assertThrows(fn)
  assert(error instanceof Error)
  assertMatch(error.message, pattern)
}

/** The text of a Part that is exactly `{ text }` and nothing more, whatever the text says. */
function onlyText(part: Part | null | undefined): string {
  assert(part && 'text' in part, 'expected a part with text')
  assertEquals(Object.keys(part), ['text'])
  return part.text
}

/** The watched branches, each with a `since` that is a string, and every other field exactly as given. */
function assertWatched(world: World, expected: Omit<ReturnType<typeof watchedBranches>[number], 'since'>[]) {
  const watched = watchedBranches(world)
  for (const { since } of watched) assertEquals(typeof since, 'string')
  assertEquals(watched.map(({ since: _since, ...rest }) => rest), expected)
}

/** An inbox that holds `before` exactly, then an unblock whose reason names the failed runs. */
function assertUnblockedInbox(inbox: ResumeItem[], before: ResumeItem[]) {
  assertEquals(inbox.slice(0, -1), before)
  const unblocked = inbox.at(-1)
  assert(unblocked?.kind === 'unblocked', 'expected the inbox to end with the unblock')
  assertEquals(Object.keys(unblocked).sort(), ['kind', 'reason'])
  assertStringIncludes(onlyText(unblocked.reason), 'failed 5 times')
}

const A = '3ec91359-c53b-80cf-83a5-e88a6c4e37f0'
const B = '3ec91359-c53b-805e-845a-c9aabc496ab6'
const START = Date.parse('2026-10-07T10:00:00.000Z')
const LIMITS = { maxFailedRuns: 5 }
const WT = { path: '/w/bot_fix_a', branch: 'bot_fix_a', portIndex: 1 }
const SHA = 'a'.repeat(40)
const PR = 'https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/pull/300'
const done_file = '/w/.vha/outcomes/1.json'

type Input = Record<string, unknown> & { type: string }

/** Events one minute apart, through the real parser, so every fixture is a valid log. */
const logOf = (events: Input[]) =>
  parseLog(
    events
      .map((event, i) => JSON.stringify({ ts: new Date(START + i * 60_000).toISOString(), card: A, ...event }))
      .join('\n'),
  )

function worldOf(events: Input[]): World {
  return fold(logOf(events), LIMITS)
}
const cardIn = (world: World, id = A) => {
  const card = world.cards.get(id)
  if (!card) throw new Error(`no card ${id}`)
  return card
}
const NOW = new Date(START + 24 * 3600_000)

const admit = (card = A, priority: string | null = null, created = '2026-10-01T00:00:00.000Z'): Input => ({
  type: 'card.admitted',
  card,
  title: 'Fix A',
  priority,
  created,
})
const started = (card = A): Input[] => [
  admit(card),
  { type: 'worktree.created', card, ...WT },
  { type: 'worker.launched', card },
  { type: 'worker.session', card, session: 'sess-1' },
]
const outcome = (kind: string, n = 1): Input => ({ type: 'worker.outcome', kind, file: `/w/.vha/outcomes/${n}.json` })
function runFinished(request: number, exitCode: number, kind: 'run' | 'hand' = 'run'): Input {
  return {
    type: 'test.finished',
    request,
    kind,
    runDir: `/w/.vha/runs/r${request}`,
    exitCode,
    failure: exitCode === 0 ? null : 'exit 1 at `FAILED | 3 passed | 1 failed`',
  }
}

/** A started card back in the queue after answering its question. */
const idle = (): Input[] => [
  ...started(),
  outcome('ask'),
  { type: 'card.replied', commentIds: ['c'], newest: '2026-10-07T10:00:00.000Z', file: '/r1' },
]

/** Appends a worker turn that asks for a run, the run, and its result; returns the events. */
function runCycle(events: Input[], exitCode: number): Input[] {
  const next = [...events, { type: 'worker.launched' }, outcome('run', events.length)]
  const request = next.length
  return [...next, { type: 'test.launched', request, tester: 1 }, runFinished(request, exitCode)]
}

describe('a card from admission to QA', () => {
  it('walks every state a passing card goes through', () => {
    const events: Input[] = [admit()]
    assertEquals(cardIn(worldOf(events)).state, 'Queued')
    assertMatches(nextWorker(worldOf(events), NOW), { card: A, worktree: null })

    events.push({ type: 'worktree.created', ...WT }, { type: 'worker.launched' }, { type: 'worker.session', session: 'sess-1' })
    assertMatches(cardIn(worldOf(events)), { state: 'Working', worker: true, session: 'sess-1' })

    events.push(outcome('ask'))
    assertEquals(cardIn(worldOf(events)).state, 'Waiting on you')
    events.push({ type: 'card.replied', commentIds: ['c1'], newest: '2026-10-07T10:30:00.000Z', file: '/w/r.json' })
    assertEquals(cardIn(worldOf(events)).state, 'Queued')

    events.push({ type: 'worker.launched' })
    assertEquals(cardIn(worldOf(events)).delivered, [{ kind: 'replies', file: '/w/r.json' }])

    events.push(outcome('run', 2))
    const run = events.length
    assertMatches(cardIn(worldOf(events)), { state: 'Queued for test run', pending: { id: run, kind: 'run' } })
    events.push({ type: 'test.launched', request: run, tester: 1 })
    assertEquals(cardIn(worldOf(events)).state, 'Testing')
    events.push(runFinished(run, 0))
    assertMatches(cardIn(worldOf(events)), { state: 'Queued', tester: null, pending: null })

    events.push({ type: 'worker.launched' }, { type: 'checks.started', file: '/w/.vha/outcomes/3.json' })
    assertMatches(cardIn(worldOf(events)), { state: 'Checking', worker: true })
    events.push({ type: 'pr.pushed', url: PR, sha: SHA })
    let world = worldOf(events)
    assertMatches(cardIn(world), { state: 'Awaiting CI', worker: false, tester: null, pr: PR, pending: null })
    assertEquals(cardIn(world).comments.at(-1), {
      for: events.length,
      parts: [{ text: `**PR opened:** ${PR}. Waiting for CI.\n\n` }, { file: '/w/.vha/outcomes/3.json', field: 'summary' }],
      attach: null,
    })

    events.push({ type: 'ci.passed', url: PR, sha: SHA })
    world = worldOf(events)
    const card = cardIn(world)
    assertEquals(card.state, 'Finished')
    assertMatches(desiredFields(card, world, NOW), { 'Bot state': 'Finished', Status: 'QA', PR: card.pr })
  })
})

describe('limits', () => {
  it('blocks after BOT_MAX_FAILED_RUNS failed runs in a row, commenting on each before', () => {
    let events = idle()
    for (let i = 0; i < 4; i += 1) events = runCycle(events, 1)
    let card = cardIn(worldOf(events))
    assertMatches(card, { state: 'Queued', streaks: { failedRuns: 4 } })
    const failures = card.comments.filter(({ parts: [first] }) => 'text' in first && first.text.startsWith('**Test run failed'))
    assertEquals(failures.length, 4)

    events = runCycle(events, 1)
    card = cardIn(worldOf(events))
    assertEquals(card.state, 'Blocked')
    assertEquals(card.block, {
      text: "the worker's test runs failed 5 times in a row (last: exit 1 at `FAILED | 3 passed | 1 failed`).",
    })
  })

  it('starts the failed-run count over after a passing run', () => {
    let events = idle()
    for (let i = 0; i < 4; i += 1) events = runCycle(events, 1)
    events = runCycle(events, 0)
    events = runCycle(events, 1)
    assertMatches(cardIn(worldOf(events)), { state: 'Queued', streaks: { failedRuns: 1 } })
  })

  it('retries one turn without an outcome, and blocks on the second in a row', () => {
    const once = started().concat({ type: 'worker.failed', why: 'no_outcome', detail: 'no .vha/outcome.json was written' })
    assertMatches(cardIn(worldOf(once)), { state: 'Queued', inbox: [{ kind: 'bad-outcome' }] })
    const twice = once.concat({ type: 'worker.launched' }, { type: 'worker.failed', why: 'bad_outcome', detail: 'run needs a command' })
    assertEquals(cardIn(worldOf(twice)).state, 'Blocked')
  })

  it('blocks a worker that overran twice', () => {
    const events = started().concat(
      { type: 'worker.failed', why: 'overran', detail: '' },
      { type: 'worker.launched' },
      { type: 'worker.failed', why: 'overran', detail: '' },
    )
    assertEquals(cardIn(worldOf(events)).block, { text: 'the worker ran past its time cap 2 times.' })
  })

  it('waits a minute before retrying a failed worktree, and blocks after three', () => {
    const once = [admit(), { type: 'worktree.failed', error: 'deno install failed' }]
    const at = START + 60_000
    assertEquals(nextWorker(worldOf(once), new Date(at + 1000)), null)
    assertMatches(nextWorker(worldOf(once), new Date(at + WORKTREE_RETRY_MS)), { card: A })
    const thrice = once.concat({ type: 'worktree.failed', error: 'x' }, { type: 'worktree.failed', error: 'git said no' })
    assertEquals(cardIn(worldOf(thrice)).block, { text: 'creating the worktree failed 3 times (last: git said no).' })
  })

  it('blocks at once, on the first failure, when the database dump is missing, naming what a human does', () => {
    const events = [admit(), { type: 'worktree.failed', error: '/repo/db/dumps/latest does not exist', resource: 'dump_missing' }]
    const card = cardIn(worldOf(events))
    assertMatches(card, { state: 'Blocked', worktree: null })
    assertMatch(
      onlyText(card.block),
      /^the card's databases cannot be made: \/repo\/db\/dumps\/latest does not exist\. A human must make the dump .*then set Bot state to Queued\.$/,
    )
    assertEquals(card.comments.at(-1)?.parts[0], { text: '**Blocked:** ' })
    assertEquals(nextWorker(worldOf(events), NOW), null)
  })

  it('blocks at once on a stale dump, and tries again once a human has unblocked the card', () => {
    const events = [admit(), { type: 'worktree.failed', error: 'db/dumps/latest is 40 days old; the limit is 30', resource: 'dump_stale' }]
    assertStringIncludes(onlyText(cardIn(worldOf(events)).block), 'from a stale dump: db/dumps/latest is 40 days old')
    // Not a retry to wait a minute for: the unblock is the retry.
    const unblocked = [...events, { type: 'card.unblocked' }]
    assertMatches(cardIn(worldOf(unblocked)), { state: 'Queued', streaks: { worktreeFailures: 0 }, lastWorktreeFailure: null })
    assertMatches(nextWorker(worldOf(unblocked), new Date(START + 3 * 60_000)), { card: A, worktree: null })
  })

  it('counts a failure with no resource toward the three, as before', () => {
    const events = [admit(), { type: 'worktree.failed', error: 'a' }, { type: 'worktree.failed', error: 'b' }]
    assertMatches(cardIn(worldOf(events)), { state: 'Queued', streaks: { worktreeFailures: 2 } })
  })
})

describe('unblocking', () => {
  it('resets the counts and tells the worker why it had stopped, keeping replies but not the old result', () => {
    let events = idle()
    for (let i = 0; i < 5; i += 1) events = runCycle(events, 1)
    events.push({ type: 'card.replied', commentIds: ['c2'], newest: '2026-10-07T12:00:00.000Z', file: '/r2' })
    events.push({ type: 'card.unblocked' })
    const card = cardIn(worldOf(events))
    assertMatches(card, { state: 'Queued', block: null, streaks: { failedRuns: 0 } })
    assertUnblockedInbox(card.inbox, [{ kind: 'replies', file: '/r2' }])
  })

  it('keeps a merge of origin/main the worker still owes', () => {
    let events = idle()
    for (let i = 0; i < 5; i += 1) events = runCycle(events, 1)
    events.push({ type: 'worktree.unmerged', why: 'would-not-merge' }, { type: 'card.unblocked' })
    assertUnblockedInbox(cardIn(worldOf(events)).inbox, [{ kind: 'merge-main' }])
  })

  it('refuses an unblock for a card that is not blocked, naming the line', () => {
    assertThrowsMatching(() => worldOf([admit(), { type: 'card.unblocked' }]), /line 2 \(card\.unblocked .*\): the card is Queued, not Blocked/)
  })
})

describe('talks', () => {
  it('takes a talk with a card waiting on you as its reply, resuming the worker on it', () => {
    const world = worldOf([...started(), outcome('ask'), { type: 'card.talked' }])
    assertMatches(cardIn(world), { state: 'Queued', inbox: [{ kind: 'talked' }] })
    assertEquals(nextWorker(world, NOW)?.card, A)
  })

  it('leaves a blocked card blocked, keeping the talk for the turn after it is unblocked', () => {
    let events = idle()
    for (let i = 0; i < 5; i += 1) events = runCycle(events, 1)
    events.push({ type: 'card.talked' })
    assertEquals(cardIn(worldOf(events)).state, 'Blocked')
    events.push({ type: 'card.unblocked' })
    assertUnblockedInbox(cardIn(worldOf(events)).inbox, [{ kind: 'talked' }])
  })

  it('ignores a talk with a card that is gone', () => {
    const card = cardIn(worldOf([...started(), outcome('ask'), { type: 'card.withdrawn', by: 'kill' }, { type: 'card.talked' }]))
    assertMatches(card, { state: 'Gone', inbox: [] })
  })
})

describe('interrupts and pauses', () => {
  it('re-queues an interrupted worker with a note, and an interrupted test for a rerun', () => {
    const working = started().concat({ type: 'worker.interrupted' })
    assertMatches(cardIn(worldOf(working)), { state: 'Queued', worker: false, inbox: [{ kind: 'interrupted' }] })

    const testing = started().concat(outcome('run'))
    const request = testing.length
    testing.push({ type: 'test.launched', request, tester: 2 }, { type: 'test.interrupted', request })
    assertMatches(cardIn(worldOf(testing)), { state: 'Queued for test run', tester: null, pending: { id: request } })
    assertMatches(nextTester(worldOf(testing)), { card: A, request: { id: request } })
  })

  it('pauses every worker until the usage limit resets', () => {
    const events = [...started(), { type: 'worker.usage_limited', until: '2026-10-07T18:00:00.000Z' }, admit(B)]
    const world = worldOf(events)
    const before = new Date('2026-10-07T17:59:00.000Z')
    const after = new Date('2026-10-07T18:00:00.000Z')
    assertEquals(stateOf(cardIn(world), world, before), 'Paused')
    assertEquals(nextWorker(world, before), null)
    assertEquals(stateOf(cardIn(world), world, after), 'Queued')
    assertEquals(nextWorker(world, after)?.card, A)
  })
})

describe('queues', () => {
  it('starts workers by priority, then oldest', () => {
    const C = '3ea91359-c53b-8025-aa2c-c73113c5e58f'
    const world = worldOf([
      admit(A, null, '2026-10-01T00:00:00.000Z'),
      admit(B, 'Low', '2026-10-02T00:00:00.000Z'),
      admit(C, 'Low', '2026-10-01T00:00:00.000Z'),
    ])
    assertEquals(nextWorker(world, NOW)?.card, C)
  })

  it('passes over a card a human is talking to, taking the next', () => {
    const world = worldOf([admit(A, 'High'), { type: 'worktree.created', ...WT }, admit(B, 'Low')])
    assertEquals(nextWorker(world, NOW)?.card, A)
    assertEquals(nextWorker(world, NOW, new Set([WT.path]))?.card, B)
  })

  it('skips held cards until released', () => {
    const held = [admit(), { type: 'card.held' }]
    assertEquals(nextWorker(worldOf(held), NOW), null)
    assertEquals(nextWorker(worldOf([...held, { type: 'card.released' }]), NOW)?.card, A)
  })

  it('tests first in, first out, a hand run included, but never a hand run while the card is being worked', () => {
    const events = [...started(), outcome('ask'), ...started(B), { type: 'test.requested', command: 'deno task test --ignore=test/web', servers: false }]
    const hand = events.length
    events.push({ ...outcome('run'), card: B })
    assertMatches(nextTester(worldOf(events)), { card: A, request: { id: hand, kind: 'hand' } })
    events.push({ type: 'test.launched', request: hand, tester: 1 })
    assertMatches(nextTester(worldOf(events)), { card: B, request: { id: hand + 1, kind: 'run' } })

    const working = worldOf([...started(), { type: 'test.requested', command: 'deno task test --ignore=test/web', servers: false }])
    assertEquals(nextTester(working), null)
  })

  it('leaves the card where it was after a hand run', () => {
    const events = [...started(), outcome('ask'), { type: 'test.requested', command: 'deno task test test/web/a.test.ts', servers: true }]
    const request = events.length
    events.push({ type: 'test.launched', request, tester: 1 }, runFinished(request, 1, 'hand'))
    assertMatches(cardIn(worldOf(events)), { state: 'Waiting on you', hand: [], tester: null, streaks: { failedRuns: 0 } })
  })
})

describe('tests that do not run', () => {
  it('sends a merge conflict back to the worker', () => {
    const events = [...started(), outcome('run')]
    const request = events.length
    events.push({ type: 'test.launched', request, tester: 1 }, { type: 'test.conflicted', request })
    assertMatches(cardIn(worldOf(events)), { state: 'Queued', inbox: [{ kind: 'conflict' }] })
  })

  it('tells the next turn to merge origin/main when the bot could not at its start, once', () => {
    const events = [
      ...started(),
      { type: 'worker.interrupted' },
      { type: 'worktree.unmerged', why: 'would-not-merge' },
      { type: 'worktree.unmerged', why: 'talking' },
    ]
    assertMatches(cardIn(worldOf(events)), { state: 'Queued', inbox: [{ kind: 'interrupted' }, { kind: 'merge-main' }] })
    assertEquals(cardIn(worldOf([...events, { type: 'worker.launched' }])).delivered, [
      { kind: 'interrupted' },
      { kind: 'merge-main' },
    ])
  })

  it('blocks a branch that changed a protected path', () => {
    const events = [...started(), outcome('run')]
    const request = events.length
    events.push({ type: 'test.launched', request, tester: 1 }, { type: 'test.refused', request, files: ['scripts/hygiene.sh'] })
    assertEquals(cardIn(worldOf(events)).block, {
      text: 'this branch changes protected paths (scripts/hygiene.sh); a human must make that change.',
    })
  })
})

describe('withdrawn and done cards', () => {
  it('lists what is left to clean up, and ignores what their dying worker reports', () => {
    const events = [...started(), { type: 'card.withdrawn', by: 'kill' }]
    assertEquals(goneWork(worldOf(events)), [{ card: A, by: 'kill', worker: true, tester: false, worktree: WT }])
    events.push(outcome('ask'), { type: 'worktree.removed' })
    const world = worldOf(events)
    assertMatches(cardIn(world), { state: 'Gone', worker: false, comments: [] })
    assertEquals(goneWork(world), [])
    assertEquals(desiredFields(cardIn(world), world, NOW), { Bot: false })
  })

  it('admits a card again only once its worktree is gone', () => {
    const gone = [admit(), { type: 'worktree.created', ...WT }, { type: 'card.withdrawn', by: 'notion' }]
    assertThrowsMatching(() => worldOf([...gone, admit()]), /already the bot/)
    const again = worldOf([...gone, { type: 'worktree.removed' }, admit()])
    assertMatches(cardIn(again), { state: 'Queued', gone: null, worktree: null })
  })
})

describe('the Notion mirror', () => {
  it('writes changed fields, then comments oldest first, until everything is acknowledged', () => {
    const events = [...started(), outcome('ask')]
    let world = worldOf(events)
    assertEquals(nextNotion(world, NOW), {
      kind: 'set',
      card: A,
      fields: { 'Bot state': 'Waiting on you', Status: 'In progress', 'Bot session': 'sess-1', Worktree: 'bot_fix_a' },
    })
    events.push({ type: 'notion.wrote', fields: { 'Bot state': 'Waiting on you', Status: 'In progress', 'Bot session': 'sess-1', Worktree: 'bot_fix_a' } })
    world = worldOf(events)
    const ask = events.length - 1
    assertMatches(nextNotion(world, NOW), { kind: 'comment', card: A, worktree: WT.path, comment: { for: ask } })
    events.push({ type: 'notion.commented', for: ask })
    assertEquals(nextNotion(worldOf(events), NOW), null)
  })

  it('clears the Worktree field once the worktree is removed', () => {
    const events = [...started(), { type: 'notion.wrote', fields: { Worktree: 'bot_fix_a' } }, { type: 'card.done' }, { type: 'worktree.removed' }]
    assertEquals(nextNotion(worldOf(events), NOW), { kind: 'set', card: A, fields: { Worktree: null } })
  })
})

describe('findCard', () => {
  it('knows a card by its dashed id, its hex id, or its branch', () => {
    const world = worldOf(started())
    assertEquals(findCard(world, A)?.id, A)
    assertEquals(findCard(world, A.replace(/-/g, ''))?.id, A)
    assertEquals(findCard(world, 'bot_fix_a')?.id, A)
    assertEquals(findCard(world, 'nope'), null)
  })
})

const checking = (): Input[] => [...started(), { type: 'checks.started', file: done_file }]
const pushed = (sha = SHA): Input => ({ type: 'pr.pushed', url: PR, sha })

describe('a done: checks, then the PR, then CI', () => {
  it('holds the worker while its checks run, and shows Working on Notion', () => {
    const world = worldOf(checking())
    const card = cardIn(world)
    assertEquals(card.state, 'Checking')
    assertEquals(card.worker, true)
    assertEquals(desiredFields(card, world, NOW)['Bot state'], 'Working')
    assertEquals(nextWorker(world, NOW), null)
    assertEquals(nextTester(world), null)
  })

  it('opens the PR and waits for CI: the PR is posted with the done’s summary, and nothing is left to test', () => {
    const world = worldOf([...checking(), pushed()])
    const card = cardIn(world)
    assertEquals(card.state, 'Awaiting CI')
    assertEquals(card.worker, false)
    assertEquals(card.pr, PR)
    assertEquals(card.pending, null)
    assertEquals(nextTester(world), null)
    assertMatches(desiredFields(card, world, NOW), { 'Bot state': 'Awaiting CI', Status: 'In progress', PR })
    assertEquals(card.comments.at(-1)?.parts, [{ text: `**PR opened:** ${PR}. Waiting for CI.\n\n` }, { file: done_file, field: 'summary' }])
  })

  it('a second push after a failed CI says the PR was updated, and waits for CI again', () => {
    const b = 'b'.repeat(40)
    const world = worldOf([
      ...checking(),
      pushed(),
      { type: 'ci.failed', url: PR, sha: SHA, failure: 'lint failed' },
      { type: 'worker.launched' },
      { type: 'checks.started', file: '/w/.vha/outcomes/2.json' },
      pushed(b),
    ])
    const card = cardIn(world)
    assertEquals(card.state, 'Awaiting CI')
    assertEquals(card.comments.at(-1)?.parts, [{ text: `**PR updated:** ${PR}. Waiting for CI.\n\n` }, { file: '/w/.vha/outcomes/2.json', field: 'summary' }])
  })

  it('failed checks go back to the worker with the log, and a third blocks', () => {
    const fail: Input = { type: 'checks.failed', result: 'failed', log: '/w/.vha/checks/1.log', failure: 'exit 1 at `npm run lint`', files: [] }
    const again: Input[] = [{ type: 'worker.launched' }, { type: 'checks.started', file: done_file }, fail]
    let world = worldOf([...checking(), fail])
    assertMatches(cardIn(world), { state: 'Queued', worker: false, checking: null })
    assertEquals(cardIn(world).inbox.at(-1), { kind: 'checks-failed', log: '/w/.vha/checks/1.log', failure: 'exit 1 at `npm run lint`' })
    assertEquals(cardIn(world).comments.at(-1)?.parts, [
      { text: '**Checks before the PR failed:** exit 1 at `npm run lint`. Sent back to the worker to fix.' },
    ])
    world = worldOf([...checking(), fail, ...again, ...again])
    assertEquals(cardIn(world).state, 'Blocked')
  })

  it('a conflict goes back to the worker without counting; a protected path blocks', () => {
    const conflicted = worldOf([
      ...checking(),
      { type: 'checks.failed', result: 'conflicted', log: null, failure: 'merging origin/main conflicted', files: [] },
    ])
    assertEquals(cardIn(conflicted).state, 'Queued')
    assertEquals(cardIn(conflicted).inbox.at(-1), { kind: 'conflict' })
    assertEquals(cardIn(conflicted).streaks.failedDones, 0)
    const refused = worldOf([
      ...checking(),
      { type: 'checks.failed', result: 'refused', log: null, failure: 'protected paths changed', files: ['scripts/hygiene.sh'] },
    ])
    assertEquals(cardIn(refused).state, 'Blocked')
  })

  it('a failed push goes back to the worker; three in a row block', () => {
    const failed: Input = { type: 'pr.failed', error: 'gh: 502' }
    const again: Input[] = [{ type: 'worker.launched' }, { type: 'checks.started', file: done_file }, failed]
    const world = worldOf([...checking(), failed])
    assertMatches(cardIn(world), { state: 'Queued', worker: false, checking: null })
    assertEquals(cardIn(world).inbox.at(-1), { kind: 'pr-failed', error: 'gh: 502' })
    assertEquals(cardIn(worldOf([...checking(), failed, ...again, ...again])).state, 'Blocked')
  })

  it('an interrupted check goes back to the worker', () => {
    const world = worldOf([...checking(), { type: 'worker.interrupted' }])
    assertMatches(cardIn(world), { state: 'Queued', worker: false, checking: null })
    assertEquals(cardIn(world).inbox.at(-1), { kind: 'interrupted' })
  })

  it('events after a withdrawal only settle bookkeeping', () => {
    const ends: Input[] = [
      pushed(),
      { type: 'pr.failed', error: 'x' },
      { type: 'checks.failed', result: 'failed', log: null, failure: 'x', files: [] },
    ]
    for (const end of ends) {
      const world = worldOf([...checking(), { type: 'card.withdrawn', by: 'notion' }, end])
      assertMatches(cardIn(world), { state: 'Gone', worker: false, checking: null })
    }
  })
})

describe('what a card is doing, and since when', () => {
  const at = (i: number) => new Date(START + i * 60_000).toISOString()

  it('stamps each state, worker turn and test with the event that started it', () => {
    const events = started()
    assertMatches(cardIn(worldOf(events)), { state: 'Working', stateSince: at(2), workerSince: at(2), turns: 1 })

    events.push(outcome('run'))
    const request = events.length
    events.push({ type: 'test.launched', request, tester: 1 })
    assertMatches(cardIn(worldOf(events)), { stateSince: at(5), workerSince: null, testerSince: at(5) })

    events.push(runFinished(request, 0), { type: 'card.reprioritized', priority: 'High' }, { type: 'worker.launched' })
    assertMatches(cardIn(worldOf(events)), { stateSince: at(8), testerSince: null, workerSince: at(8), turns: 2 })
  })

  it('keeps a state’s time through events that do not change it', () => {
    const events = [...started(), outcome('ask'), { type: 'card.held' }, { type: 'card.reprioritized', priority: 'Low' }]
    assertEquals(cardIn(worldOf(events)).stateSince, at(4))
  })
})

const awaitingCi = (): Input[] => [...checking(), pushed()]

describe('a card awaiting CI', () => {
  const fail = (failure: string): Input => ({ type: 'ci.failed', url: PR, sha: SHA, failure })

  it('is finished, moved to QA, once CI passed on its PR', () => {
    const world = worldOf([...awaitingCi(), { type: 'ci.passed', url: PR, sha: SHA }])
    const card = cardIn(world)
    assertEquals(card.state, 'Finished')
    assertEquals(card.comments.at(-1)?.parts, [{ text: `**CI passed** on ${SHA.slice(0, 8)}: ${PR} is ready for review.` }])
    assertMatches(desiredFields(card, world, NOW), { 'Bot state': 'Finished', Status: 'QA', PR })
  })

  it('goes back to the worker with what failed, and a third failure blocks it', () => {
    const events = [...awaitingCi(), fail('lint failed')]
    const card = cardIn(worldOf(events))
    assertMatches(card, { state: 'Queued', streaks: { failedDones: 1 } })
    assertEquals(card.inbox.at(-1), { kind: 'ci-failed', failure: 'lint failed' })
    assertEquals(card.comments.at(-1)?.parts, [{ text: `**CI failed** on ${SHA.slice(0, 8)}: lint failed. Sent back to the worker to fix.` }])

    const retry = (failure: string) => {
      events.push({ type: 'worker.launched' }, { type: 'checks.started', file: done_file })
      events.push(pushed(), fail(failure))
    }
    retry('b')
    assertEquals(cardIn(worldOf(events)).streaks.failedDones, 2)
    retry('c')
    assertEquals(cardIn(worldOf(events)).state, 'Blocked')
  })

  it('is finished by a merge too, and CI is only taken from a card that waits for it', () => {
    assertMatches(cardIn(worldOf([...awaitingCi(), { type: 'pr.merged', url: PR }])), { state: 'Finished', prMerged: true })
    assertThrowsMatching(() => worldOf([...started(), { type: 'ci.passed', url: PR, sha: SHA }]), /the card is Working, not Awaiting CI/)
  })

  it('is not idle for a hand test and is looked at for CI on GitHub', () => {
    const world = worldOf(awaitingCi())
    assertEquals(isIdle(cardIn(world)), false)
    assertWatched(world, [{ card: A, state: 'Awaiting CI', path: WT.path, branch: WT.branch, pr: PR }])
  })
})

describe('a blocked card whose PR was merged', () => {
  const PR = 'https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/pull/314'
  const blocked = (): Input[] => [...started(), outcome('blocked')]

  it('is finished, its PR on the card and moved to QA, with a comment saying why', () => {
    const world = worldOf([...blocked(), { type: 'pr.merged', url: PR }])
    const card = cardIn(world)
    assertMatches(card, { state: 'Finished', pr: PR, prMerged: true, block: null, pending: null })
    assertEquals(card.comments.at(-1)?.parts, [{ text: `**PR merged:** ${PR}. The bot has finished this card.` }])
    assertMatches(desiredFields(card, world, NOW), { 'Bot state': 'Finished', Status: 'QA', PR })
    assertEquals(nextWorker(world, NOW), null)
  })

  it('moves a card no worker started to QA too', () => {
    const events: Input[] = [admit()]
    for (let i = 0; i < 3; i += 1) events.push({ type: 'worktree.failed', error: 'x' })
    events.push({ type: 'pr.merged', url: PR })
    assertMatches(desiredFields(cardIn(worldOf(events)), worldOf(events), NOW), { Status: 'QA' })
  })

  it('refuses a merged PR for a card that is not blocked, and ignores one for a card that is gone', () => {
    assertThrowsMatching(() => worldOf([...started(), { type: 'pr.merged', url: PR }]), /pr\.merged .*the card is Working, not Blocked or Awaiting CI/)
    const gone = cardIn(worldOf([...blocked(), { type: 'card.done' }, { type: 'pr.merged', url: PR }]))
    assertMatches(gone, { state: 'Gone', prMerged: false })
  })

  it('is looked for only on live blocked cards that have a worktree', () => {
    const world = worldOf([
      ...blocked(),
      ...started(B).map((event) => ({ ...event, card: B })),
      admit('3ea91359-c53b-8025-aa2c-c73113c5e58f'),
      ...['x', 'y', 'z'].map((error) => ({ type: 'worktree.failed', card: '3ea91359-c53b-8025-aa2c-c73113c5e58f', error })),
    ])
    assertEquals(cardIn(world, '3ea91359-c53b-8025-aa2c-c73113c5e58f').state, 'Blocked')
    assertWatched(world, [{ card: A, state: 'Blocked', path: WT.path, branch: WT.branch, pr: null }])
    assertEquals(watchedBranches(worldOf([...blocked(), { type: 'card.withdrawn', by: 'notion' }])), [])
  })
})
