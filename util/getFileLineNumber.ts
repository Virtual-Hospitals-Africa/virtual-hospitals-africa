import { assert } from 'std/assert/assert.ts'

const cwd = Deno.cwd()
const file_cwd_prefix = 'file://' + cwd

// Deno stack format is either:
//  "at functionName (file:///path/to/file.ts:line:column)"
//  "at file:///path/to/file.ts:line:column"
function extractLineInfo(caller_line: string) {
  const match_with_function_name = caller_line.match(
    /^at (.*) \((.*):(\d+):(\d+)\)$/,
  )
  if (match_with_function_name) {
    const [_match, _function_name, file_name, line_number, column_number] =
      match_with_function_name
    return { file_name, line_number, column_number }
  }
  const match_without_function_name = caller_line.match(
    /^at (.*):(\d+):(\d+)$/,
  )
  assert(
    match_without_function_name,
    `Could not extractLineInfo caller line: ${caller_line}`,
  )
  const [_match, file_name, line_number, column_number] =
    match_without_function_name
  return { file_name, line_number, column_number }
}

export function getFileLineNumber(up_stack_levels = 0) {
  try {
    throw new Error()
  } catch (e) {
    assert(e instanceof Error)
    const stack = e.stack!.split('\n')

    const caller_line = stack[2 + up_stack_levels].trim()
    const { file_name, line_number, column_number } = extractLineInfo(
      caller_line,
    )

    let pretty_file_name = file_name.replace(file_cwd_prefix, '')
    if (pretty_file_name.startsWith('/')) {
      pretty_file_name = pretty_file_name.slice(1)
    }

    return `${pretty_file_name}:${line_number}:${column_number}`
  }
}
