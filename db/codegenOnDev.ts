import { runCommandAssertExitCodeZero } from '../util/command.ts'
import { opts as db_opts } from './db.ts'

export async function codegenOnDev() {
  if (db_opts?.database === 'vha_dev') {
    await runCommandAssertExitCodeZero('deno', {
      args: ['task', 'db:codegen'],
    })
  }
}
