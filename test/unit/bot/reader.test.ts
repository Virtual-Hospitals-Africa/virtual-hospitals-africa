import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

import { parseLog } from '../../../bot/events.ts'
import { fold, type World } from '../../../bot/fold.ts'
import type { Card as BoardCard } from '../../../bot/notionModel.ts'
import { boardEvents, repliesFrom } from '../../../bot/reader.ts'
import { assertMatches } from '../../../util/assertMatches.ts'

const A = '5f0a7c21-4b6e-4d3a-9c18-2e7d90b1a3c4'
const B = '8c3e51d0-72a9-4f64-b1d5-0a96e4c7f238'
const START = Date.parse('2026-10-07T10:00:30.000Z')

function worldOf(events: Record<string, unknown>[]): World {
  return fold(
    parseLog(
      events
        .map((event, i) => JSON.stringify({ ts: new Date(START + i * 60_000).toISOString(), card: A, ...event }))
        .join('\n'),
    ),
    { maxFailedRuns: 5 },
  )
}

const logged = (world: World) => {
  const card = world.cards.get(A)
  if (!card) throw new Error('card A is not in the log')
  return card
}

function on_board(overrides: Partial<BoardCard> = {}): BoardCard {
  return {
    id: A,
    url: 'https://www.notion.so/a',
    title: 'Fix A',
    status: 'Not started',
    botState: null,
    session: null,
    worktree: null,
    lastComment: null,
    pr: null,
    hold: false,
    priority: null,
    created: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

const admitted = { type: 'card.admitted', title: 'Fix A', priority: null, created: '2026-10-01T00:00:00.000Z' }
const worktree = { type: 'worktree.created', path: '/w/a', branch: 'bot_fix_a', portIndex: 1 }
const blocked = [admitted, worktree, { type: 'worker.launched' }, { type: 'worker.outcome', kind: 'blocked', file: '/w/a/.vha/outcomes/1.json' }]

describe('boardEvents', () => {
  it('admits a ticked card that has not started, unless it is held', () => {
    assertEquals(boardEvents([on_board()], worldOf([])), [
      { type: 'card.admitted', card: A, title: 'Fix A', priority: null, created: '2026-10-01T00:00:00.000Z' },
    ])
    assertEquals(boardEvents([on_board({ hold: true })], worldOf([])), [])
    assertEquals(boardEvents([on_board({ status: 'In progress' })], worldOf([])), [])
  })

  it('says nothing about a card whose board and log agree', () => {
    assertEquals(boardEvents([on_board()], worldOf([admitted])), [])
  })

  it('notices a hold, a release, a new priority and a move to Done', () => {
    const world = worldOf([admitted])
    assertEquals(boardEvents([on_board({ hold: true, priority: 'High' })], world), [
      { type: 'card.held', card: A },
      { type: 'card.reprioritized', card: A, priority: 'High' },
    ])
    assertEquals(boardEvents([on_board()], worldOf([admitted, { type: 'card.held' }])), [{ type: 'card.released', card: A }])
    assertEquals(boardEvents([on_board({ status: 'Done' })], world), [{ type: 'card.done', card: A }])
  })

  it('withdraws a card missing from a complete board', () => {
    assertEquals(boardEvents([], worldOf([admitted])), [{ type: 'card.withdrawn', card: A, by: 'notion' }])
  })

  it('unblocks only once the bot has written Blocked and a human has set it back to Queued', () => {
    const not_yet_written = worldOf(blocked)
    assertEquals(boardEvents([on_board({ status: 'In progress', botState: 'Queued' })], not_yet_written), [])
    const written = worldOf([...blocked, { type: 'notion.wrote', fields: { 'Bot state': 'Blocked' } }])
    assertEquals(boardEvents([on_board({ status: 'In progress', botState: 'Blocked' })], written), [])
    assertEquals(boardEvents([on_board({ status: 'In progress', botState: 'Queued' })], written), [
      { type: 'card.unblocked', card: A },
    ])
  })

  it('admits a withdrawn card again only once its worktree is gone', () => {
    const gone = [admitted, worktree, { type: 'card.withdrawn', by: 'notion' }]
    assertEquals(boardEvents([on_board()], worldOf(gone)), [])
    assertMatches(boardEvents([on_board()], worldOf([...gone, { type: 'worktree.removed' }])), [{ type: 'card.admitted' }])
  })

  it('leaves other cards alone', () => {
    assertEquals(boardEvents([on_board(), on_board({ id: B, status: 'In progress' })], worldOf([admitted])), [])
  })
})

describe('repliesFrom', () => {
  it('reads from the minute the first worker started, rounded down as Notion rounds comments', () => {
    const world = worldOf([admitted, worktree, { type: 'worker.launched' }])
    assertEquals(repliesFrom(logged(world)), '2026-10-07T10:02:00.000Z')
  })

  it('reads from the newest reply handled once there is one', () => {
    const world = worldOf([
      admitted,
      worktree,
      { type: 'worker.launched' },
      { type: 'card.replied', commentIds: ['c1'], newest: '2026-10-07T11:00:00.000Z', file: '/r' },
    ])
    assertEquals(repliesFrom(logged(world)), '2026-10-07T11:00:00.000Z')
  })
})
