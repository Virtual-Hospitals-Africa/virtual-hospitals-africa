import memoize from '../util/memoize.ts'
import { parseWithSchema } from './s_expression.ts'
import { insertable_finding_base } from './s_expression_schemas.ts'

const base = (s_expression: string) => parseWithSchema(s_expression, insertable_finding_base)

export const parseSExpressionAsInsertableFinding = typeof window !== 'undefined' ? memoize(base) : base
