import { IntermediateBaseRecord, Maybe, RecordDisplays, RenderedEvaluationRelativeToHealthWorker } from '../types.ts'
import { findingToDisplayableRecord, formatRecord } from './patient_records.ts'
import { Priority, PRIORITY_SNOMED_CODES } from './priorities.ts'
import { Lang } from './s_expression_schemas.ts'

/*
  The record behind the priority chip: an evaluation whose display is the priority itself
  ("Emergency") and whose source relations say what raised it, listed in its popover as
  "Due to: Anaphylaxis" / "Based on: <rule description>".

  Both the backend, reading the priority off the encounter (db/models/priority.ts), and the
  warning signs page, raising the priority in the browser from a dry run, build it here so
  the popover reads the same either way.
*/

type PriorityRelation = NonNullable<RenderedEvaluationRelativeToHealthWorker['source_relations']>[number]

// Anything already rendered with its displays: a finding, a diagnosis, a total score
export type DisplayedRecord = IntermediateBaseRecord & { displays: RecordDisplays }

export function dueToRelation(record: DisplayedRecord): PriorityRelation {
  return {
    id: record.id,
    created_at: record.created_at,
    patient_encounter_id: record.patient_encounter_id,
    root_snomed_concept_id: record.root_snomed_concept_id,
    root_snomed_concept_name: record.root_snomed_concept_name,
    root_snomed_concept_category: record.root_snomed_concept_category,
    specific_snomed_concept_id: record.specific_snomed_concept_id,
    specific_snomed_concept_name: record.specific_snomed_concept_name,
    specific_snomed_concept_category: record.specific_snomed_concept_category,
    value: null,
    relation_name: 'Due to' as const,
    displays: record.displays,
  }
}

/*
  A record the priority is due to that has not been inserted: the finding the health worker
  has just entered, or a diagnosis the dry run says it would indicate. Displayed exactly as
  the inserted record will be, without ids it does not have yet.
*/
export function dueToHypotheticalRelation(node: Lang['finding'] | Lang['evaluation']): PriorityRelation {
  return dueToRelation(formatRecord(findingToDisplayableRecord(node)))
}

export function buildPriorityEvaluation({
  priority,
  created_at,
  due_to,
  id = '@@buildPriorityEvaluation@@',
  value_snomed_concept_id = PRIORITY_SNOMED_CODES[priority],
  based_on = null,
}: {
  priority: Priority
  created_at: Date | string
  due_to: PriorityRelation[]
  id?: string
  value_snomed_concept_id?: string
  // The description of the system priority evaluation rule that raised it, where one did
  based_on?: Maybe<string>
}): RenderedEvaluationRelativeToHealthWorker {
  const based_on_relations: PriorityRelation[] = based_on
    ? [{
      id: 'system-priority-evaluation',
      created_at: new Date(),
      patient_encounter_id: '',
      root_snomed_concept_id: value_snomed_concept_id,
      root_snomed_concept_name: priority,
      root_snomed_concept_category: 'finding' as const,
      specific_snomed_concept_id: value_snomed_concept_id,
      specific_snomed_concept_name: priority,
      specific_snomed_concept_category: 'finding' as const,
      value: null,
      relation_name: 'Based on' as const,
      displays: {
        finding: 'System evaluation',
        value: based_on,
        full: based_on,
      },
    }]
    : []

  return {
    type: 'evaluation' as const,
    id,
    created_at,
    patient_encounter_id: '',
    root_snomed_concept_id: value_snomed_concept_id,
    root_snomed_concept_name: priority,
    root_snomed_concept_category: 'finding' as const,
    specific_snomed_concept_id: value_snomed_concept_id,
    specific_snomed_concept_name: priority,
    specific_snomed_concept_category: 'finding' as const,
    modifiers: [],
    attributes: [],
    evaluations: [],
    destination_relations: [],
    source_relations: [...due_to, ...based_on_relations],
    displays: {
      finding: priority,
      value: null,
      full: priority,
    },
    value: null,
    priority: null,
    provider: null,
    as_part_of_procedure: null,
    employment_id: null,
  }
}
