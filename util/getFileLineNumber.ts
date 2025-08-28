import { assert } from 'std/assert/assert.ts'

const cwd = Deno.cwd()
const file_cwd_prefix = 'file://' + cwd

export function getFileLineNumber(up_stack_levels = 0) {
  try {
    throw new Error()
  } catch (e) {
    assert(e instanceof Error)
    const stack = e.stack!.split('\n')

    // Deno stack format: "at functionName (file:///path/to/file.ts:line:column)"
    const callerLine = stack[2 + up_stack_levels].trim()

    const [_match, _function_name, file_name, line_number, column_number] =
      callerLine
        .match(/at (.*) \((.*):(\d+):(\d+)\)/)!

    let pretty_file_name = file_name.replace(file_cwd_prefix, '')
    if (pretty_file_name.startsWith('/')) {
      pretty_file_name = pretty_file_name.slice(1)
    }

    return `${pretty_file_name}:${line_number}:${column_number}`
  }
}
