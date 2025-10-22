import { assert } from 'std/assert/assert.ts'

const cwd = Deno.cwd()
const file_cwd_prefix = 'file://' + cwd

// Deno stack format is either:
//  "at functionName (file:///path/to/file.ts:line:column)"
//  "at file:///path/to/file.ts:line:column"
function extractLineInfo(caller_line: string) {
  console.log(caller_line)
  const match_with_function_name = caller_line.match(
    /^at (.*) \((.*):(\d+):(\d+)\)$/,
  )
  if (match_with_function_name) {
    const [_match, function_name, file_name, line_number, column_number] =
      match_with_function_name
    return { function_name, file_name, line_number, column_number }
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

export function getCaller(up_stack_levels = 0) {
  try {
    throw new Error()
  } catch (e) {
    assert(e instanceof Error)
    const stack = e.stack!.split('\n')
    console.log(stack)

    const caller_line = stack[2 + up_stack_levels].trim()
    const { file_name, function_name, line_number, column_number } =
      extractLineInfo(
        caller_line,
      )

    let pretty_file_name = file_name.replace(file_cwd_prefix, '')
    if (pretty_file_name.startsWith('/')) {
      pretty_file_name = pretty_file_name.slice(1)
    }
    return {
      pretty_file_name,
      function_name,
      line_number: parseInt(line_number),
      column_number: parseInt(column_number),
    }
  }
}

export function getFileLineNumber(up_stack_levels = 0) {
  const { pretty_file_name, line_number, column_number } = getCaller(
    up_stack_levels,
  )

  return `${pretty_file_name}:${line_number}:${column_number}`
}
