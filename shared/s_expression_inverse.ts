import { AnyNode, Lang } from './s_expression_schemas.ts'

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
      if (node.snomed_concept) {
        parts.push(snomedConceptToString(node.snomed_concept))
      }
      if (node.finding_snomed_concept) {
        parts.push(snomedConceptToString(node.finding_snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const attr of node.attributes) parts.push(inverseSExpression(attr))
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      for (const nf of node.not_findings) parts.push(inverseSExpression(nf))
      return `(${parts.join(' ')})`
    }

    case 'attribute': {
      return `(attribute ${
        snomedConceptToString(node.relation_snomed_concept)
      } ${snomedConceptToString(node.finding_snomed_concept)})`
    }

    case 'qualifier': {
      const parts: string[] = ['qualifier']
      if (node.snomed_concept) {
        parts.push(snomedConceptToString(node.snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'not_finding': {
      const parts: string[] = ['not_finding']
      parts.push(snomedConceptToString(node.finding_snomed_concept))
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'procedure': {
      const parts: string[] = ['procedure']
      if (node.snomed_concept) {
        parts.push(snomedConceptToString(node.snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'evaluation': {
      const parts: string[] = ['evaluation']
      if (node.snomed_concept) {
        parts.push(snomedConceptToString(node.snomed_concept))
      }
      if (node.value_snomed_concept) {
        parts.push(snomedConceptToString(node.value_snomed_concept))
      }
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

    case 'task': {
      return `(task ${inverseSExpression(node.left)} ${
        inverseSExpression(node.right)
      })`
    }

    default: {
      const _exhaustive: never = node
      throw new Error(`Unknown node type: ${(_exhaustive as AnyNode).atom}`)
    }
  }
}
