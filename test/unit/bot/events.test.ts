import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatch } from 'std/assert/assert_match.ts'
import { assertThrows } from 'std/assert/assert_throws.ts'

import { lineOf, MAX_EVENT_BYTES, parseLog } from '../../../bot/events.ts'

function assertThrowsMatching(fn: () => unknown, pattern: RegExp) {
  const error = assertThrows(fn)
  assert(error instanceof Error)
  assertMatch(error.message, pattern)
}

const CARD = '3ec91359-c53b-80cf-83a5-e88a6c4e37f0'
const NOW = new Date('2026-10-07T10:00:00.000Z')
const line = (event: Record<string, unknown>) => JSON.stringify({ ts: NOW.toISOString(), card: CARD, ...event })

describe('parseLog', () => {
  it('numbers events by line', () => {
    const events = parseLog(`${line({ type: 'card.held' })}\n${line({ type: 'card.released' })}\n`)
    assertEquals(events.map((e) => [e.id, e.type]), [
      [1, 'card.held'],
      [2, 'card.released'],
    ])
  })

  it('names the line that is not JSON', () => {
    assertThrowsMatching(() => parseLog(`${line({ type: 'card.held' })}\n{"type":`), /line 2 is not JSON/)
  })

  it('names the line with an unknown type or a field it does not have', () => {
    assertThrowsMatching(() => parseLog(line({ type: 'card.exploded' })), /line 1 is not a valid event/)
    assertThrowsMatching(() => parseLog(line({ type: 'card.held', extra: 1 })), /line 1 is not a valid event/)
    assertThrowsMatching(() => parseLog(line({ type: 'card.held', card: 'page1' })), /line 1 is not a valid event/)
  })
})

describe('lineOf', () => {
  it('stamps the time when the event has none', () => {
    assertEquals(JSON.parse(lineOf({ type: 'card.done', card: CARD }, NOW)), { ts: NOW.toISOString(), type: 'card.done', card: CARD })
  })

  it('refuses an invalid event', () => {
    assertThrows(() => lineOf({ type: 'worker.outcome', card: CARD, kind: 'maybe', file: '/x' }, NOW))
  })

  it('refuses a line too long to append in one write', () => {
    const error = 'x'.repeat(MAX_EVENT_BYTES)
    assertThrowsMatching(() => lineOf({ type: 'pr.failed', card: CARD, error }, NOW), /limit is 4096/)
  })

  it('accepts the PR-first events and rejects a short sha', () => {
    const events = [
      { type: 'checks.started', file: '/w/.vha/outcomes/1.json' },
      { type: 'checks.failed', result: 'failed', log: '/w/.vha/checks/1.log', failure: 'x', files: [] },
      { type: 'pr.pushed', url: 'https://github.com/o/r/pull/9', sha: 'a'.repeat(40) },
      { type: 'pr.merged', url: 'https://github.com/o/r/pull/9' },
      { type: 'ci.passed', url: 'https://github.com/o/r/pull/9', sha: 'a'.repeat(40) },
      { type: 'ci.failed', url: 'https://github.com/o/r/pull/9', sha: 'a'.repeat(40), failure: 'lint failed' },
      { type: 'test.requested', command: 'deno task test test/web/a.test.ts', servers: true },
      { type: 'test.finished', request: 1, kind: 'run', runDir: null, exitCode: 0, failure: null },
      { type: 'test.finished', request: 1, kind: 'hand', runDir: '/w/.vha/runs/r', exitCode: 1, failure: 'x' },
    ]
    for (const event of events) lineOf({ card: CARD, ...event }, NOW)
    assertThrows(() => lineOf({ type: 'pr.pushed', card: CARD, url: 'https://github.com/o/r/pull/9', sha: 'abc' }, NOW))
  })

  it('has no demo, screenshot or verify events, nor a done request for a tester', () => {
    const gone = [
      { type: 'demo.captured', url: 'https://github.com/o/r/pull/9' },
      { type: 'pr.opened', url: 'https://github.com/o/r/pull/9' },
      { type: 'verify.merged', request: 1, sha: 'a'.repeat(40) },
      { type: 'test.finished', request: 1, kind: 'verify', runDir: null, exitCode: 0, failure: null },
      { type: 'test.finished', request: 1, kind: 'done', runDir: null, exitCode: 0, failure: null },
      { type: 'worker.outcome', kind: 'done', file: '/x' },
      { type: 'test.requested', command: 'x', devices: 1 },
    ]
    for (const event of gone) assertThrows(() => lineOf({ card: CARD, ...event }, NOW))
  })

  it('takes a worktree failure for a missing or stale dump, and no other reason', () => {
    for (const resource of ['dump_missing', 'dump_stale']) {
      lineOf({ type: 'worktree.failed', card: CARD, error: 'x', resource }, NOW)
    }
    lineOf({ type: 'worktree.failed', card: CARD, error: 'x' }, NOW)
    assertThrows(() => lineOf({ type: 'worktree.failed', card: CARD, error: 'x', resource: 'disk_full' }, NOW))
  })
})
