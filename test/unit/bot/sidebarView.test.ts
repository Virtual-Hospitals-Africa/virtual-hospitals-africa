import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatch } from 'std/assert/assert_match.ts'
import { assertStringIncludes } from 'std/assert/assert_string_includes.ts'

import { parseLog } from '../../../bot/events.ts'
import { fold, type World } from '../../../bot/fold.ts'
import { activityOf, elapsed, type Line, liveCards, notionUrl, sidebarLines } from '../../../bot/sidebarView.ts'
import { assertMatches } from '../../../util/assertMatches.ts'

const A = '3ec91359-c53b-80cf-83a5-e88a6c4e37f0'
const B = '3ec91359-c53b-805e-845a-c9aabc496ab6'
const C = '3ea91359-c53b-8025-aa2c-c73113c5e58f'
const START = Date.parse('2026-10-07T10:00:00.000Z')
const WIDTH = 44
const BOT = { running: true, down: [] }
const ON_DISK = () => true

type Input = Record<string, unknown> & { type: string; card: string }

function worldOf(events: Input[]): World {
  return fold(
    parseLog(events.map((event, i) => JSON.stringify({ ts: new Date(START + i * 60_000).toISOString(), ...event })).join('\n')),
    { maxFailedRuns: 5 },
  )
}
const after = (minutes: number) => new Date(START + minutes * 60_000)

const admit = (card: string, title: string): Input => ({ type: 'card.admitted', card, title, priority: null, created: '2026-10-01T00:00:00.000Z' })
const started = (card: string, path: string): Input[] => [
  { type: 'worktree.created', card, path, branch: 'bot_x', portIndex: 1 },
  { type: 'worker.launched', card },
]

/** A asks a question of its worker session, B is testing a run, C has a worker on its second turn. */
const BOARD: Input[] = [
  admit(A, 'Fix the bus stop'),
  admit(B, 'Redundant name on the review screen of setup'),
  admit(C, 'Add a pet'),
  ...started(A, '/w/a'),
  { type: 'worker.outcome', card: A, kind: 'ask', file: '/w/a/.vha/outcomes/1.json' },
  ...started(B, '/w/b'),
  { type: 'worker.outcome', card: B, kind: 'run', file: '/w/b/.vha/outcomes/1.json' },
  { type: 'test.launched', card: B, request: 9, tester: 2 },
  ...started(C, '/w/c'),
  { type: 'worker.outcome', card: C, kind: 'ask', file: '/w/c/.vha/outcomes/1.json' },
  { type: 'card.replied', card: C, commentIds: ['c1'], newest: '2026-10-07T10:00:00.000Z', file: '/r' },
  { type: 'worker.launched', card: C },
  { type: 'worker.session', card: A, session: 'sess-a' },
]

// Built from the escape character, which a regex literal may not contain.
const ESC = '\u001b'
const HYPERLINK = new RegExp(`${ESC}\\]8;;[^${ESC}]*${ESC}\\\\`, 'g')
const COLOUR = new RegExp(`${ESC}\\[[0-9;]*m`, 'g')
const plain = (line: Line) => line.text.replace(HYPERLINK, '').replace(COLOUR, '')
const lineOf = (lines: Line[], text: string) => {
  const found = lines.find((line) => plain(line).includes(text))
  if (!found) throw new Error(`no line has "${text}": ${lines.map(plain).join(' / ')}`)
  return found
}
const clickAt = (line: Line, column: number) => line.spans.find((span) => column >= span.from && column < span.to)?.action

describe('elapsed', () => {
  it('reads as seconds, minutes, hours, then days', () => {
    assertEquals([0, 45_000, 724_000, 11_520_000, 187_200_000, -5].map(elapsed), ['0s', '45s', '12m04s', '3h12m', '2d04h', '0s'])
  })
})

describe('the cards', () => {
  it('lists running cards first, then those waiting on a human, leaving gone ones out', () => {
    const world = worldOf([...BOARD, admit('3ec91359-c53b-8000-8000-000000000000', 'Queued one'), { type: 'card.done', card: A }])
    assertEquals(liveCards(world, after(20)).map((card) => card.title), [
      'Redundant name on the review screen of setup',
      'Add a pet',
      'Queued one',
    ])
  })

  it('says what is running and since when, or how long it has been idle', () => {
    const world = worldOf(BOARD)
    const activity = (id: string) => {
      const card = world.cards.get(id)
      if (!card) throw new Error(`no card ${id}`)
      return activityOf(card, world, ON_DISK)
    }
    assertEquals(activity(A), { what: 'worker', since: after(5).toISOString(), target: 'talk' })
    assertEquals(activity(B), { what: 'tester #2 · run', since: after(9).toISOString(), target: 'test' })
    assertEquals(activity(C), { what: 'claude · turn 2', since: after(14).toISOString(), target: 'worker' })
  })

  it('says when there is no worktree to look at: none yet, or one removed from disk', () => {
    const world = worldOf([...BOARD, admit('3ec91359-c53b-8000-8000-000000000000', 'Queued one')])
    const queued = liveCards(world, after(20)).at(-1)
    const a = world.cards.get(A)
    if (!queued || !a) throw new Error('missing cards')
    assertMatches(activityOf(queued, world, ON_DISK), { what: 'no worktree yet', target: null })
    assertEquals(activityOf(a, world, (path) => path !== '/w/a'), { what: 'worktree gone', since: after(5).toISOString(), target: null })
  })
})

describe('the lines', () => {
  const lines = sidebarLines(worldOf(BOARD), BOT, after(20), WIDTH, ON_DISK)

  it('heads with the bot and how many cards are working and testing', () => {
    assertEquals(plain(lines[0]), ' ● bot running · 1 working · 1 testing')
    const stopped = sidebarLines(worldOf(BOARD), { running: false, down: ['notion-reader'] }, after(20), WIDTH, ON_DISK)
    assertEquals(stopped.slice(0, 2).map(plain), [' ✘ bot stopped · 1 working · 1 testing', ' DOWN: notion-reader'])
  })

  it('gives each card its title, then its state, what is running and for how long', () => {
    assertEquals(plain(lineOf(lines, 'Testing')), '   Testing · tester #2 · run · 11m00s')
    assertEquals(plain(lineOf(lines, 'turn 2')), '   Working · claude · turn 2 · 6m00s')
    assertEquals(plain(lineOf(lines, 'Waiting on you')), '   Waiting on you · worker · 15m00s')
  })

  it('shows a card finished by its merged PR as its Notion Status, not its state', () => {
    const merged = sidebarLines(
      worldOf([
        ...BOARD,
        { type: 'worker.outcome', card: C, kind: 'blocked', file: '/w/c/.vha/outcomes/2.json' },
        { type: 'pr.merged', card: C, url: 'https://github.com/o/r/pull/9' },
      ]),
      BOT,
      after(20),
      WIDTH,
      ON_DISK,
    )
    assertEquals(plain(lineOf(merged, 'idle')), '   QA · idle · 3m00s')
  })

  it('fits a long title in the width, leaving room for the Notion link', () => {
    const line = lineOf(lines, 'Redundant')
    assertEquals([...plain(line)].length, WIDTH)
    assertMatch(plain(line), /^ ● Redundant name on the review sc… +notion ↗$/)
  })

  it('shows what is running for a click on the card, and opens Notion for one on its link', () => {
    const title = lineOf(lines, 'Redundant')
    assertEquals(clickAt(title, 5), { kind: 'show', target: { kind: 'test', card: B, worktree: '/w/b' } })
    assertEquals(clickAt(title, WIDTH - 2), { kind: 'notion', url: notionUrl(B) })
    assertEquals(clickAt(lineOf(lines, 'turn 2'), 10), { kind: 'show', target: { kind: 'worker', card: C, worktree: '/w/c' } })
    assertEquals(notionUrl(B), 'https://www.notion.so/3ec91359c53b805e845ac9aabc496ab6')
  })

  it('underlines an idle worker session, a click on which talks to it; the rest of the card is its card.log', () => {
    const waiting = lineOf(lines, 'Waiting on you')
    assertStringIncludes(waiting.text, '\u001b[33;4mworker')
    const worker = '   Waiting on you · '.length
    assertEquals(clickAt(waiting, worker), { kind: 'show', target: { kind: 'talk', card: A, worktree: '/w/a' } })
    assertEquals(clickAt(waiting, worker + 'worker'.length), { kind: 'show', target: { kind: 'log', card: A, worktree: '/w/a' } })
    assertEquals(clickAt(lineOf(lines, 'Fix the bus stop'), 5), { kind: 'show', target: { kind: 'log', card: A, worktree: '/w/a' } })
  })

  it('shows a card whose worktree is gone, which only Notion can be opened from', () => {
    const gone = sidebarLines(worldOf(BOARD), BOT, after(20), WIDTH, (path) => path !== '/w/a')
    assertEquals(plain(lineOf(gone, 'Waiting on you')), '   Waiting on you · worktree gone · 15m00s')
    const title = lineOf(gone, 'Fix the bus stop')
    assertEquals(clickAt(title, 5), undefined)
    assertEquals(clickAt(lineOf(gone, 'Waiting on you'), 5), undefined)
    assertEquals(clickAt(title, WIDTH - 2), { kind: 'notion', url: notionUrl(A) })
  })

  it('makes the title and the label links a terminal opens', () => {
    assertStringIncludes(lineOf(lines, 'Redundant').text, `\u001b]8;;${notionUrl(B)}\u001b\\`)
  })
})
