declare module 's-expression' {
  type SExpressionNode = string | SExpressionNode[]
  function parse(expression: string): SExpressionNode | Error
  export default parse
}
