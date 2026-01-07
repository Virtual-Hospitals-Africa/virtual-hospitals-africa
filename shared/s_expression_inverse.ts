import { AnyNode, Lang } from './s_expression_schemas.ts'

// TODO: come back to this idea maybe.
// As it stands two s_expressions could refer to the same snomed concept,
// but if one uses id and the other uses name/category they won't match exactly
// function lookupSnomedConceptById(node: Lang['snomed_concept'])

function snomedConceptToString(node: Lang['snomed_concept']): string {
  if (node.type === 'id') {
    return node.id
  }
  return `(snomed_concept "${node.name}" "${node.category}")`
}

export function inverseSExpression(node: AnyNode): string {
  switch (node.atom) {
    case 'snomed_concept':
      return snomedConceptToString(node)

    case 'finding': {
      const parts: string[] = ['finding']
      if (node.root_snomed_concept) {
        parts.push(snomedConceptToString(node.root_snomed_concept))
      }
      if (node.specific_snomed_concept) {
        parts.push(snomedConceptToString(node.specific_snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const attr of node.attributes) parts.push(inverseSExpression(attr))
      for (const event of node.events) parts.push(inverseSExpression(event))
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'attribute': {
      const parts: string[] = [
        'attribute',
        snomedConceptToString(node.specific_snomed_concept),
      ]
      if (node.value) {
        parts.push(snomedConceptToString(node.value))
      }
      return `(${parts.join(' ')})`
    }

    case 'event': {
      return `(event ${
        snomedConceptToString(node.specific_snomed_concept)
      } "${node.value.datetime}")`
    }

    case 'qualifier': {
      const parts: string[] = [
        'qualifier',
        snomedConceptToString(node.specific_snomed_concept),
      ]
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'procedure': {
      const parts: string[] = ['procedure']
      if (node.root_snomed_concept) {
        parts.push(snomedConceptToString(node.root_snomed_concept))
      }
      if (node.specific_snomed_concept) {
        parts.push(snomedConceptToString(node.specific_snomed_concept))
      }
      for (const attr of node.attributes) parts.push(inverseSExpression(attr))
      for (const event of node.events) parts.push(inverseSExpression(event))
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'evaluation': {
      const parts: string[] = ['evaluation']
      if (node.root_snomed_concept) {
        parts.push(snomedConceptToString(node.root_snomed_concept))
      }
      if (node.specific_snomed_concept) {
        parts.push(snomedConceptToString(node.specific_snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const attr of node.attributes) parts.push(inverseSExpression(attr))
      for (const event of node.events) parts.push(inverseSExpression(event))
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      if (node.evaluates) parts.push(inverseSExpression(node.evaluates))
      return `(${parts.join(' ')})`
    }

    case 'evaluates': {
      return `(evaluates ${inverseSExpression(node.expression)})`
    }

    case 'measurement': {
      return `(measurement ${snomedConceptToString(node.snomed_concept)})`
    }

    case 'active_condition': {
      return `(active_condition ${snomedConceptToString(node.snomed_concept)})`
    }

    case 'check_for': {
      return `(check_for ${inverseSExpression(node.finding)})`
    }

    case 'units': {
      return `(units ${node.value} ${node.units})`
    }

    case '>':
    case '<':
    case '>=':
    case '<=':
    case '=': {
      return `(${node.atom} ${inverseSExpression(node.left)} ${
        inverseSExpression(node.right)
      })`
    }

    case 'not': {
      return `(not ${inverseSExpression(node.expression)})`
    }

    case 'and': {
      const parts = node.expressions.map(inverseSExpression)
      return `(and ${parts.join(' ')})`
    }

    case 'or': {
      const parts = node.expressions.map(inverseSExpression)
      return `(or ${parts.join(' ')})`
    }
    
    case 'any': {
      const parts = node.findings.map(inverseSExpression)
      return `(any ${parts.join(' ')})`
    }

    case 'all': {
      const parts = node.findings.map(inverseSExpression)
      return `(all ${parts.join(' ')})`
    }

    case 'task': {
      return `(task ${inverseSExpression(node.when)} ${
        inverseSExpression(node.procedure)
      })`
    }

    default: {
      const _exhaustive: never = node
      throw new Error(`Unknown node type: ${(_exhaustive as AnyNode).atom}`)
    }
  }
}
