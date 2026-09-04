import { Lang, QueryableEvidenceNode, SnomedConcept } from './s_expression_schemas.ts'
import { assertUnreachable } from '../util/assertUnreachable.ts'

export function* allConceptsToLookFor(
  node: QueryableEvidenceNode | Lang['task' | 'system_diagnosis_rule' | 'system_priority_evaluation'],
): Generator<SnomedConcept> {
  switch (node.atom) {
    case 'qualifier':
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      break
    case 'attribute':
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      break
    case 'active_condition':
      yield node.snomed_concept
      break
    case 'finding':
    case 'evaluation':
      if (node.root_snomed_concept) yield node.root_snomed_concept
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      if (node.value_snomed_concept) yield node.value_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      for (const attribute of node.attributes) {
        yield* allConceptsToLookFor(attribute)
      }
      if ('excluding' in node) {
        for (const excluding of node.excluding) {
          yield* allConceptsToLookFor(excluding.finding)
        }
      }
      break
    case 'procedure':
      if (node.root_snomed_concept) yield node.root_snomed_concept
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      if (Array.isArray(node.value)) {
        for (const n of node.value) {
          yield* allConceptsToLookFor(n)
        }
      }
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      break

    case 'diagnosis':
    case 'measurement':
      yield node.snomed_concept
      break
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      if (node.type === 'measurement') {
        yield* allConceptsToLookFor(node.measurement)
      } else {
        yield node.timestamp_of_event.event_snomed_concept
        yield* allConceptsToLookFor(node.timestamp_of_event.finding)
      }
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allConceptsToLookFor(expression)
      }
      break
    case 'not':
      yield* allConceptsToLookFor(node.expression)
      break
    case 'task':
      yield* allConceptsToLookFor(node.due_to)
      yield* allConceptsToLookFor(node.to_be_done)
      break
    case 'system_diagnosis_rule':
      yield* allConceptsToLookFor(node.due_to)
      yield* allConceptsToLookFor(node.diagnosis)
      break
    case 'system_priority_evaluation':
      yield* allConceptsToLookFor(node.due_to)
      break
    default:
      assertUnreachable(node)
  }
}
