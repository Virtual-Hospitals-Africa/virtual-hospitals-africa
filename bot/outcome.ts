// The file a worker writes to end its turn, .vha/outcome.json (bot/WORKER.md).
import { existsSync } from 'std/fs/exists.ts'
import { resolve } from 'std/path/resolve.ts'
import { SEPARATOR } from 'std/path/constants.ts'
import { z } from 'zod'

const text = z.string().trim().min(1)

/**
 * Whether a command needs the card's web servers (test/web) started and waited on first: what the
 * worker said, else whether the command names test/web, or is a bare `deno task test`, which runs
 * every test, test/web included, unless it ignores it.
 */
export function needsServers(command: string, servers?: boolean): boolean {
  if (servers !== undefined) return servers
  if (/(^|[\s/])test\/web(\/|\s|$)/.test(command)) return true
  return /\bdeno task test(\s+--(use-build|no-parallel|verbose))*\s*$/.test(command)
}

export const outcome_schema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('ask'), comment: text, attachments: z.array(z.string()).optional() }),
  z.strictObject({
    kind: z.literal('run'),
    command: text,
    servers: z.boolean().optional(),
    why: z.string().optional(),
  }),
  z.strictObject({
    kind: z.literal('done'),
    summary: text,
    prTitle: text,
    prBody: text,
  }),
  z.strictObject({ kind: z.literal('blocked'), reason: text }),
])

export type Outcome = z.infer<typeof outcome_schema>

/** Paths git sees as changed or new in the worktree; ignored files, .vha/ among them, never count. */
function uncommitted(worktree: string): string[] {
  const { success, stdout, stderr } = new Deno.Command('git', { args: ['-C', worktree, 'status', '--porcelain', '--untracked-files=all'] }).outputSync()
  if (!success) throw new Error(`git status failed in ${worktree}: ${new TextDecoder().decode(stderr).trim()}`)
  return new TextDecoder().decode(stdout)
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3))
}

export type Checked = { ok: true; outcome: Outcome } | { ok: false; why: string }

/** Reads and validates a worker's outcome; its attachments must be files inside its worktree. */
export function checkOutcome(file: string, worktree: string): Checked {
  if (!existsSync(file)) return { ok: false, why: 'no .vha/outcome.json was written' }
  let json: unknown
  try {
    json = JSON.parse(Deno.readTextFileSync(file))
  } catch {
    return { ok: false, why: 'outcome.json is not JSON' }
  }
  const parsed = outcome_schema.safeParse(json)
  if (!parsed.success) return { ok: false, why: z.prettifyError(parsed.error).replace(/\n/g, ' ') }
  const outcome = parsed.data
  if (outcome.kind === 'run' || outcome.kind === 'done') {
    const dirty = uncommitted(worktree)
    if (dirty.length > 0) {
      return { ok: false, why: `commit your changes before a run or done outcome (uncommitted: ${dirty.slice(0, 5).join(', ')})` }
    }
  }
  if (outcome.kind === 'ask') {
    const root = Deno.realPathSync(worktree)
    for (const path of outcome.attachments ?? []) {
      const full = resolve(root, path)
      if (!existsSync(full) || !Deno.realPathSync(full).startsWith(root + SEPARATOR)) {
        return { ok: false, why: `attachment ${path} must be a file inside the worktree` }
      }
    }
  }
  return { ok: true, outcome }
}

/** An outcome the bot already accepted, read back from .vha/outcomes/. */
export function readOutcome(file: string): Outcome {
  return outcome_schema.parse(JSON.parse(Deno.readTextFileSync(file)))
}
