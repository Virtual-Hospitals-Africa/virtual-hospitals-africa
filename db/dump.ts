import * as db from './db.ts'
import { runCommand } from '../util/command.ts'

export function dump() {
  return runCommand('pg_dump', {
    args: ['-Fc', '-O', db.uri],
    stdout: 'inherit',
  })
}

if (import.meta.main) {
  await dump()
}
