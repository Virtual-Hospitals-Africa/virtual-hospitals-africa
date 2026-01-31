// Auto-generated from ntasks.lisp
// Do not edit manually
import { parseWithSchema } from '../shared/s_expression.ts'
import { ntask } from '../shared/s_expression_schemas.ts'

function parseAsNTask(expr: string) {
  return parseWithSchema(expr, ntask)
}

export const NTASKS = [].map(parseAsNTask)
