// Events in words, for each card's card.log and for `deno task bot:watch` (docs/bot.md#debugging).
import type { BotEvent } from './events.ts'

export function describe(event: BotEvent): string {
  switch (event.type) {
    case 'card.admitted':
      return `admitted: ${event.title} (priority ${event.priority ?? 'unset'})`
    case 'card.reprioritized':
      return `priority is now ${event.priority ?? 'unset'}`
    case 'card.replied':
      return `${event.commentIds.length} new repl${event.commentIds.length === 1 ? 'y' : 'ies'} (${event.file})`
    case 'card.talked':
      return 'a human talked to the worker session in its talk window'
    case 'card.unblocked':
      return 'unblocked by a human'
    case 'card.held':
      return 'held (Bot hold ticked)'
    case 'card.released':
      return 'released (Bot hold unticked)'
    case 'card.withdrawn':
      return event.by === 'kill' ? 'killed with bot:kill' : 'withdrawn (Bot unticked)'
    case 'card.done':
      return 'moved to Done'
    case 'worktree.created':
      return `worktree ${event.path} on ${event.branch} (ports block ${event.portIndex})`
    case 'worktree.failed':
      return `creating the worktree failed${
        event.resource ? ` (${event.resource === 'dump_missing' ? 'no database dump' : 'stale database dump'}; blocks the card)` : ''
      }: ${event.error}`
    case 'worktree.removed':
      return 'worktree removed'
    case 'worktree.unmerged':
      return `not brought up to origin/main at the bot's start (${
        event.why === 'talking' ? 'a talk window was open' : 'it would not merge'
      }); the bot merges it before the worker's next turn`
    case 'worker.launched':
      return 'worker started'
    case 'worker.session':
      return `worker session ${event.session}`
    case 'worker.outcome':
      return `worker ended its turn: ${event.kind} (${event.file})`
    case 'worker.failed':
      return `worker turn failed (${event.why}): ${event.detail}`
    case 'worker.usage_limited':
      return `usage limit — paused until ${event.until}`
    case 'worker.interrupted':
      return 'worker interrupted'
    case 'checks.started':
      return `checks before the PR started (${event.file})`
    case 'checks.failed':
      return `checks before the PR ${event.result}: ${event.failure}${event.log ? ` (${event.log})` : ''}`
    case 'test.requested':
      return `hand run requested${event.servers ? ' with the web servers' : ''}: ${event.command}`
    case 'test.launched':
      return `tester #${event.tester} started request ${event.request}`
    case 'test.conflicted':
      return 'merging origin/main conflicted; sent back to the worker'
    case 'test.refused':
      return `refused: protected paths changed (${event.files.join(', ')})`
    case 'test.finished':
      return `${event.kind} finished: ${event.exitCode === 0 ? 'passed' : (event.failure ?? `exit ${event.exitCode}`)}${
        event.runDir ? ` (${event.runDir})` : ''
      }`
    case 'test.interrupted':
      return `test of request ${event.request} interrupted`
    case 'pr.failed':
      return `opening the PR failed: ${event.error}`
    case 'pr.pushed':
      return `pushed ${event.sha.slice(0, 8)}; PR ${event.url} opened or updated; waiting for CI`
    case 'ci.passed':
      return `CI passed on ${event.sha.slice(0, 8)}; finished`
    case 'ci.failed':
      return `CI failed on ${event.sha.slice(0, 8)}: ${event.failure}`
    case 'pr.merged':
      return `PR merged: ${event.url}; finished`
    case 'notion.wrote':
      return `Notion: ${
        Object.entries(event.fields)
          .map(([field, value]) => `${field}=${value === null ? '(cleared)' : String(value)}`)
          .join(', ')
      }`
    case 'notion.commented':
      return `Notion: posted the comment for event ${event.for}`
  }
}
