import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { NTASKS } from '../../s_expression/ntasks.ts'
import { QueryableNode, SnomedConcept, system_diagnosis_rule, system_priority_evaluation, task } from '../../shared/s_expression_schemas.ts'
import db from '../../db/db.ts'
import { filter } from '../../util/inParallel.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS } from '../../s_expression/system_priority_evaluations.ts'
import { SYSTEM_DIAGNOSIS_RULES } from '../../s_expression/system_diagnosis_rules.ts'

export function* allConceptsToLookFor(node: QueryableNode): Generator<SnomedConcept> {
  switch (node.atom) {
    case 'qualifier':
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      break
    case 'finding':
    case 'evaluation':
      if (node.root_snomed_concept) yield node.root_snomed_concept
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      if (node.value_snomed_concept) yield node.value_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
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
      yield* allConceptsToLookFor(node.left)
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allConceptsToLookFor(expression)
      }
      break
    default:
      throw new Error(`Not supported ${node.atom}`)
  }
}

async function conceptDoesNotExist({ concept }: { concept: SnomedConcept }): Promise<boolean> {
  const found = await db.selectFrom('snomed_inferred_canonical_name_and_category')
    .where('name', '=', concept.name)
    .where('category', '=', concept.category)
    .limit(1)
    .executeTakeFirst()

  return !found
}

function* nodesAndConceptsTasks() {
  for (const s_expression of NTASKS) {
    const node = parseWithSchema(s_expression, task)
    for (const concept of allConceptsToLookFor(node.due_to)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemPriorityEvaluations() {
  for (const s_expression of SYSTEM_PRIORITY_EVALUATIONS) {
    const node = parseWithSchema(s_expression, system_priority_evaluation)
    for (const concept of allConceptsToLookFor(node.due_to)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemDiagnosisRules() {
  for (const s_expression of SYSTEM_DIAGNOSIS_RULES) {
    const node = parseWithSchema(s_expression, system_diagnosis_rule)
    for (const concept of allConceptsToLookFor(node.due_to)) {
      yield { concept, node }
    }
  }
}

describe('s_expression/', () => {
  afterAll(() => db.destroy())
  describe('NTASKS', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsTasks(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
  })
  describe('SYSTEM_PRIORITY_EVALUATIONS', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemPriorityEvaluations(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
  })
  describe('SYSTEM_DIAGNOSIS_RULES', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemDiagnosisRules(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
  })
})
