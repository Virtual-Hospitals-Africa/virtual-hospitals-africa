// What a look at the Notion board means for the bot (docs/bot.md#how-it-works): the cards as Notion
// has them now, against what the event log knows, become events for what humans did.
import type { BotEvent } from './events.ts'
import type { Card as LoggedCard, World } from './fold.ts'
import type { Card as BoardCard } from './notionModel.ts'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
/** An event before its time is stamped. */
export type Draft = DistributiveOmit<BotEvent, 'ts'>

/**
 * The events for the bot's cards on the board. `board` must be the complete result of a successful
 * query: a card the log knows that is missing from it was unticked.
 */
export function boardEvents(board: BoardCard[], world: World): Draft[] {
  const drafts: Draft[] = []
  const on_board = new Set(board.map((card) => card.id))
  for (const card of board) {
    const known = world.cards.get(card.id)
    if (!known || (known.gone && known.worktree === null)) {
      if (card.status === 'Not started' && !card.hold) {
        drafts.push({ type: 'card.admitted', card: card.id, title: card.title, priority: card.priority, created: card.created })
      }
      continue
    }
    if (known.gone) continue
    if (card.status === 'Done') {
      drafts.push({ type: 'card.done', card: card.id })
      continue
    }
    if (card.hold !== known.held) drafts.push({ type: card.hold ? 'card.held' : 'card.released', card: card.id })
    if (card.priority !== known.priority) drafts.push({ type: 'card.reprioritized', card: card.id, priority: card.priority })
    if (isUnblock(card, known)) drafts.push({ type: 'card.unblocked', card: card.id })
  }
  for (const known of world.cards.values()) {
    if (!known.gone && !on_board.has(known.id)) drafts.push({ type: 'card.withdrawn', card: known.id, by: 'notion' })
  }
  return drafts
}

/**
 * A human set a Blocked card's Bot state back to Queued. Only once the bot has itself written
 * Blocked: before that, Notion still shows the state from before the block.
 */
const isUnblock = (card: BoardCard, known: LoggedCard) => known.state === 'Blocked' && known.written['Bot state'] === 'Blocked' && card.botState === 'Queued'

/** Cards whose new comments are replies for their worker: started, not gone, with a worktree. */
export const awaitingReplies = (world: World) => [...world.cards.values()].filter((card) => !card.gone && card.startedAt !== null && card.worktree !== null)

/**
 * From when to read a card's comments: its newest reply handled, else its first worker's start.
 * Notion rounds comment times down to the minute, so the start is too: a comment in the same minute
 * may be read twice, but never missed.
 */
export function repliesFrom(card: LoggedCard): string {
  const started_at = card.startedAt ?? card.created
  const minute = new Date(Math.floor(Date.parse(started_at) / 60_000) * 60_000).toISOString()
  return card.lastComment !== null && card.lastComment > minute ? card.lastComment : minute
}
