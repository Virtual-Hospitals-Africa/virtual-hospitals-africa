/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from '$fresh/server.ts'
import manifest from './fresh.gen.ts'
import config from './fresh.config.ts'
import { assert } from 'std/assert/assert.ts'
// import { getFileLineNumber } from './util/getFileLineNumber.ts'
const originalLog = console.log

const cwd = Deno.cwd()
const file_cwd_prefix = 'file://' + cwd

function getFileLineNumber(up_stack_levels = 0) {
  try {
    throw new Error()
  } catch (e) {
    assert(e instanceof Error)
    const stack = e.stack!.split('\n')

    // Deno stack format: "at functionName (file:///path/to/file.ts:line:column)"
    const callerLine = stack[2 + up_stack_levels].trim()

    const match = callerLine
      .match(/at (.*) \((.*):(\d+):(\d+)\)/)

    if (!match) {
      return callerLine
    }
    const [_match, _function_name, file_name, line_number, column_number] =
      match

    let pretty_file_name = file_name.replace(file_cwd_prefix, '')
    if (pretty_file_name.startsWith('/')) {
      pretty_file_name = pretty_file_name.slice(1)
    }

    return `${pretty_file_name}:${line_number}:${column_number}`
  }
}
setTimeout(() => originalLog(file_cwd_prefix), 100)
// Monkey-patch console.log to print
console.log = (...args: unknown[]) => {
  const line_number = getFileLineNumber(1)
  const timestamp = new Date().toISOString()
  originalLog(timestamp, line_number, ...args)
}

await start(manifest, config)
