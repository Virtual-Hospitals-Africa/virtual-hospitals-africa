import { runCommandAssertExitCodeZero } from '../util/command.ts'

// Docker images used for migrations don't ship a .git directory (see
// .dockerignore), so the commit is baked in as GIT_COMMIT at build time.
// Locally, .git is present, so we shell out to git instead.
export async function getCurrentCommit(): Promise<string> {
  const from_env = Deno.env.get('GIT_COMMIT')
  if (from_env) return from_env

  const output = await runCommandAssertExitCodeZero('git rev-parse HEAD')
  return output.trim()
}
