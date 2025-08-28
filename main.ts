/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from '$fresh/server.ts'
import manifest from './fresh.gen.ts'
import config from './fresh.config.ts'
import { getFileLineNumber } from './util/getFileLineNumber.ts'

// Monkey-patch console.log to print
const originalLog = console.log
console.log = (...args: unknown[]) => {
  const line_number = getFileLineNumber(1)
  const timestamp = new Date().toISOString()
  originalLog(timestamp, line_number, ...args)
}

await start(manifest, config)
