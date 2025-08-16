import * as db from './db.ts'
import { runCommandAssertExitCodeZero } from '../util/command.ts'

export function dump() {
  return runCommandAssertExitCodeZero('pg_dump', {
    args: ['-Fc', '--no-comments', '-O', db.uri],
    stdout: 'inherit',
  })
}

if (import.meta.main) {
  await dump()
}
