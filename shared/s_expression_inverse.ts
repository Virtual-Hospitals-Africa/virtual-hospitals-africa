import { assert } from 'std/assert/assert.ts'
import compact from '../util/compact.ts'
import { AnyNode, EventValue, Lang } from './s_expression_schemas.ts'

// TODO: come back to this idea maybe.
// As it stands two s_expressions could refer to the same snomed concept,
// but if one uses id and the other uses name/category they won't match exactly
// function lookupSnomedConceptById(node: Lang['snomed_concept'])

function isEventValue(
  value: Lang['snomed_concept'] | EventValue,
): value is EventValue {
  return value.atom === 'event'
}

function snomedConceptToString(node: Lang['snomed_concept']): string {
  return `(snomed_concept "${node.name}" "${node.category}")`
}

function quoted(str: string): string {
  assert(str, `attempting to enquote falsy value ${str}`)
  return `"${str}"`
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
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'attribute': {
      const { value } = node
      // Event-type attribute
      if (value && isEventValue(value)) {
        return `(event ${snomedConceptToString(node.specific_snomed_concept)} "${value.datetime}")`
      }
      // Regular attribute
      const parts: string[] = [
        'attribute',
        snomedConceptToString(node.specific_snomed_concept),
      ]
      if (value) {
        parts.push(snomedConceptToString(value))
      }
      return `(${parts.join(' ')})`
    }

    case 'qualifier': {
      const parts: string[] = [
        'qualifier',
        snomedConceptToString(node.specific_snomed_concept),
      ]
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      return `(${parts.join(' ')})`
    }

    case 'link': {
      return '(' + compact(['link', quoted(node.title), quoted(node.href), node.thumbnail_href && quoted(node.thumbnail_href)]).join(' ') + ')'
    }

    case 'procedure': {
      if (Array.isArray(node.value)) {
        const atom = node.value[0].atom === 'finding' ? 'check_for' : 'measure'
        const parts: string[] = [atom, ...node.value.map(inverseSExpression)]
        return `(${parts.join(' ')})`
      }

      const parts: string[] = ['procedure']
      if (node.root_snomed_concept) {
        parts.push(snomedConceptToString(node.root_snomed_concept))
      }
      if (node.specific_snomed_concept) {
        parts.push(snomedConceptToString(node.specific_snomed_concept))
      }
      if (node.value) {
        parts.push(inverseSExpression(node.value))
      }
      for (const attr of node.attributes) parts.push(inverseSExpression(attr))
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
      for (const qual of node.qualifiers) parts.push(inverseSExpression(qual))
      if (node.evaluates) parts.push(inverseSExpression(node.evaluates))
      return `(${parts.join(' ')})`
    }

    case 'evaluates': {
      return `(evaluates ${inverseSExpression(node.expression)})`
    }

    case 'measurement': {
      return `(measurement ${snomedConceptToString(node.snomed_concept)} ${node.units})`
    }

    case 'active_condition': {
      return `(active_condition ${snomedConceptToString(node.snomed_concept)})`
    }

    case '>':
    case '<':
    case '>=':
    case '<=':
    case '=': {
      return `(${node.atom} ${inverseSExpression(node.left)} ${node.right})`
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

    case 'any2': {
      const parts = node.expressions.map(inverseSExpression)
      return `(any2 ${parts.join(' ')})`
    }

    case 'task': {
      const parts: string[] = ['task', quoted(node.description)]
      // Handle ages - if single age, output directly; if multiple, wrap in (ages ...)
      const ages = node.ages.length === 1 ? node.ages[0] : `(ages ${node.ages.join(' ')})`
      parts.push(ages)
      parts.push(inverseSExpression(node.due_to))
      parts.push(inverseSExpression(node.procedure))
      return `(${parts.join(' ')})`
    }

    case 'system_priority_determination': {
      const parts = [
        'system_priority_determination',
        `"${node.description}"`,
        inverseSExpression(node.when_primary_finding),
        node.priority,
      ]
      for (const other_finding of node.when_other_findings_also_present) {
        parts.push(inverseSExpression(other_finding))
      }
      return `(${parts.join(' ')})`
    }

    case 'diagnosis': {
      return `(diagnosis ${snomedConceptToString(node.snomed_concept)} ${node.certainty_qualifier})`
    }

    case 'system_diagnosis_rule': {
      const ages = node.ages.length === 1 ? node.ages[0] : `(ages ${node.ages.join(' ')})`

      return `(system_diagnosis_rule ${inverseSExpression(node.diagnosis)} ${ages} ${inverseSExpression(node.evidence)})`
    }

    default: {
      const _exhaustive: never = node
      throw new Error(`Unknown node type: ${(_exhaustive as AnyNode).atom}`)
    }
  }
}

export function inverseSExpressions(nodes: AnyNode[]): string {
  return `(${nodes.map(inverseSExpression).join(' ')})`
}
