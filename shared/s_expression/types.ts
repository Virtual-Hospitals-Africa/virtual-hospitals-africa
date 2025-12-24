export type ParsedExpressions = {
  finding: {
    snomed_concept_id: string | null
    value_snomed_concept_id: string | null
    qualifiers: ParsedQualifierOrNotExpression[]
  }
}

export type ParsedFindingExpression = {
  atom:'finding'
  snomed_concept_id: string | null
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedProcedureExpression = {
  atom:'procedure'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedEvaluationExpression = {
  atom:'evaluation'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}

export type ParsedMeasurementExpression = {
  atom:'measurement'
  snomed_concept_id: string
}

export type ParsedUnitsExpression = {
  atom:'units'
  value: number
  units: string
}

export type ParsedQualifierExpression = {
  atom:'qualifier'
  snomed_concept_id: string
  value_snomed_concept_id: string | null
  qualifiers: ParsedQualifierOrNotExpression[]
}
export type ParsedTaskExpression = {
  atom:'task'
  if_expression: ParsedExpression
  tasks: ParsedProcedureExpression[]
}

export type ParsedNotExpression = {
  atom:'not'
  expression: ParsedExpression
}

export type ParsedOrExpression = {
  atom:'or'
  expressions: ParsedExpression[]
}

export type ParsedAndExpression = {
  atom:'and'
  expressions: ParsedExpression[]
}

export type ParsedActiveConditionExpression = {
  atom:'active_condition'
  snomed_concept_id: string
}

export type ParsedComparatorExpression<Comparator extends string> = {
  atom:Comparator
  left: ParsedMeasurementExpression
  right: ParsedUnitsExpression /*| ParsedMeasurementExpression */
}

export type ParsedComparatorExpressions =
  | ParsedComparatorExpression<'>'>
  | ParsedComparatorExpression<'<'>
  | ParsedComparatorExpression<'>='>
  | ParsedComparatorExpression<'<='>
  | ParsedComparatorExpression<'='>

export type ParsedExpression =
  | ParsedFindingExpression
  | ParsedProcedureExpression
  | ParsedEvaluationExpression
  // | ParsedEvaluatesExpression
  | ParsedQualifierExpression
  | ParsedTaskExpression
  | ParsedMeasurementExpression
  | ParsedUnitsExpression
  | ParsedNotExpression
  | ParsedOrExpression
  | ParsedAndExpression
  | ParsedActiveConditionExpression
  | ParsedComparatorExpressions

export type ParsedExpressionNodeType = ParsedExpression['type']
