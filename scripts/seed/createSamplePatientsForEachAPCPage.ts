import db from '../../db/db.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_single, Lang } from '../../shared/s_expression_schemas.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { addTestEmployee, TestEmployee } from '../../mocks/testEmployee.ts'
import { addTestEmployeeWithSession, TestEmployeeWithSession } from '../../test/_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../test/_helpers/workflows.ts'

import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSignsAdult,
  DEFAULT_ASSESSMENTS,
  DEFAULT_MEASUREMENTS,
  setupTriage,
} from '../../test/web/patients/open_encounter/triage/_setup.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VitalMeasurement, VITALS_SHARED_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { COMMON_CONDITIONS, CommonConditionKey } from '../../shared/brief_history.ts'
import { forEach } from '../../util/inParallel.ts'
import generateUUID from '../../util/uuid.ts'
import { MeasurementComparison, QueryableEvidenceNode } from '../../shared/s_expression_schemas.ts'
import entries from '../../util/entries.ts'
import fromEntries from '../../util/fromEntries.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { snomed_warning_signs } from '../../db/models/snomed_warning_signs.ts'
import { WarningSignPriority } from '../../db.d.ts'
import { snomedConceptBase } from '../../db/models/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'

type Evidence = ReturnType<typeof allEvidenceToLookFor> extends Generator<infer T> ? T : never

type APCTaskDef = {
  page_slug: string
  task_node: Lang['task']
  task_file_path: string
  evidence_s_expressions: string[]
  vital_overrides: Partial<Record<VitalMeasurement, number>>
  common_condition_keys: Set<CommonConditionKey>
  skip: boolean
}

function isVitalsBasedEvidence(evidence: Evidence | QueryableEvidenceNode): boolean {
  const finding: { atom: string; snomed_concept?: { name: string } } = (
      evidence.atom === '>' ||
      evidence.atom === '<' ||
      evidence.atom === '>=' ||
      evidence.atom === '<=' ||
      evidence.atom === '='
    )
    ? (evidence as MeasurementComparison).measurement
    : evidence as { atom: string; snomed_concept?: { name: string } }

  return (
    finding.atom === 'measurement' &&
    finding.snomed_concept != null &&
    VITALS_SHARED_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
  ) || (
    finding.atom === 'active_condition' &&
    finding.snomed_concept?.name === 'Fever'
  )
}

function vitalFromSnomedConceptName(name: string): VitalMeasurement | null {
  for (const [vital, concept] of entries(VITAL_MEASUREMENTS_SNOMED_CONCEPTS)) {
    if (concept.name === name) return vital
  }
  return null
}

function vitalValueFromComparison(atom: string, threshold: number): number {
  switch (atom) {
    case '>':
    case '>=':
      return threshold + 1
    case '<':
    case '<=':
      return threshold - 1
    default:
      return threshold
  }
}

const COMMON_CONDITION_BY_SNOMED_NAME = new Map<string, CommonConditionKey>(
  COMMON_CONDITIONS.map((c) => [c.name, c.key]),
)

export function taskAsTestCase(task_node: Lang['task'], task_file_path: string) {
  const all_evidence = new Set<string>()
  const vital_overrides: Partial<Record<VitalMeasurement, number>> = {}
  const common_condition_keys = new Set<CommonConditionKey>()
  let skip = false

  for (const evidence of allEvidenceToLookFor(task_node.due_to)) {
    if (!isVitalsBasedEvidence(evidence)) {
      if (evidence.atom === 'active_condition') {
        const key = COMMON_CONDITION_BY_SNOMED_NAME.get(evidence.snomed_concept.name)
        if (key != null) {
          common_condition_keys.add(key)
          if (key === 'diabetes') {
            vital_overrides['blood_glucose'] = vital_overrides['blood_glucose'] || 7
          }
          continue
        } else {
          // all_evidence.add(inverseSExpression({
          //   atom: 'diagnosis',
          //   snomed_concept: evidence.snomed_concept,
          //   certainty_qualifier: 'probable',
          // }))
          skip = true
          continue
        }
      }
      if (evidence.atom === 'finding') {
        if (!evidence.specific_snomed_concept) {
          assertEquals(evidence.attributes.length, 1)
          assertEquals(evidence.attributes[0].specific_snomed_concept.name, 'Finding site')
          all_evidence.add(inverseSExpression({
            ...evidence,
            specific_snomed_concept: {
              atom: 'snomed_concept',
              name: 'Pain',
              category: 'finding',
            },
          }))
          continue
        }
      }
      // TODO: exercise these rules
      if (evidence.atom === 'diagnosis') {
        skip = true
        continue
      }
      all_evidence.add(inverseSExpression(evidence))
      continue
    }

    const is_comparator = evidence.atom === '>' || evidence.atom === '<' || evidence.atom === '>=' || evidence.atom === '<=' || evidence.atom === '='
    if (is_comparator) {
      const comparison = evidence as MeasurementComparison
      const snomed_name = comparison.measurement.snomed_concept?.name
      if (snomed_name) {
        const vital = vitalFromSnomedConceptName(snomed_name)
        if (vital) {
          const threshold = comparison.value.toNumber()
          vital_overrides[vital] = vitalValueFromComparison(comparison.atom, threshold)
        }
      }
    } else if (evidence.atom === 'active_condition' && (evidence as { snomed_concept?: { name: string } }).snomed_concept?.name === 'Fever') {
      // Fever threshold is 38.5°C, so use 39.0
      vital_overrides['temperature'] = 39.0
    }
  }
  return {
    task_node,
    task_file_path,
    vital_overrides,
    common_condition_keys,
    skip,
    page_slug: pageSlugFromFilePath(task_file_path),
    evidence_s_expressions: [...all_evidence],
  }
}

export async function* tasksFromFilepath(task_file_path: string): AsyncGenerator<APCTaskDef> {
  const rules = await parseLispFile(task_file_path)
  for (const rule of rules) {
    if (rule.atom !== 'task') continue
    yield taskAsTestCase(rule, task_file_path)
  }
}

export function pageSlugFromFilePath(file_path: string): string {
  const filename = file_path.split('/').pop()!
  return filename.replace('.lisp', '')
}

export async function setupTriageForAPCTaskNode(
  { task_node, page_slug, skip, common_condition_keys, evidence_s_expressions, vital_overrides }: APCTaskDef,
  clinic: { id: string },
  nurse: TestEmployeeWithSession,
  shcp: TestEmployee,
) {
  if (skip) {
    console.log(`Skipping creating patient for ${task_node.description}`)
    return null
  }
  if (!evidence_s_expressions.length) {
    console.log(`Skipping creating patient for ${task_node.description}; no evidence to put in`)
    return null
  }
  console.log(`Creating patient for page: ${page_slug} ${task_node.description}`)

  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    clinic.id,
    {
      employment_id: nurse.health_worker.employee_id,
      is_tutorial: true,
      patient_demographics: {
        first_names: 'TESTING',
        surname: page_slug,
        name: `TESTING ${page_slug}`,
        preferred_name: 'TESTING',
        date_of_birth: '1990-01-01',
      },
    },
  )

  const brief_history = {
    common_conditions: fromEntries(COMMON_CONDITIONS.map((condition) => [condition.key, {
      existence: common_condition_keys.has(condition.key) ? 'Yes' as const : 'No' as const,
    }])),
  }

  type AdditionalFinding = { s_expression: string; existence: 'Yes'; priority_level?: WarningSignPriority }
  const additional_findings: Record<string, AdditionalFinding> = {}
  for (const s_expression of evidence_s_expressions) {
    const node = parseWithSchema(s_expression, any_query_single)
    const additional_finding: AdditionalFinding = {
      s_expression,
      existence: 'Yes' as const,
      priority_level: undefined,
    }
    const snomed_concept = 'snomed_concept' in node ? node.snomed_concept : (
      assert('specific_snomed_concept' in node && node.specific_snomed_concept), node.specific_snomed_concept
    )
    const as_searched_for_warning_sign = await snomed_warning_signs.findOne(db, {
      snomed_concept_id: snomedConceptBase(db, snomed_concept),
      age_determination: 'adult',
    })
    additional_finding.priority_level = as_searched_for_warning_sign.priority ?? undefined
    additional_findings[generateUUID()] = additional_finding
  }

  const warning_signs = {
    warning_signs: {
      ...asWarningSignsAdult([], { pregnant: brief_history.common_conditions.pregnancy.existence === 'Yes' }).warning_signs,
      ...additional_findings,
    },
  }

  const measure_vitals = {
    measurements: asVitalMeasurementFormValues({ ...DEFAULT_MEASUREMENTS.adult, ...vital_overrides }),
    assessments: asVitalAssessmentFormValues(DEFAULT_ASSESSMENTS.adult),
  }

  const result = await setupTriage({
    clinic,
    nurse,
    shcp,
    encounter,
    steps: {
      brief_history,
      warning_signs,
      height_and_weight: {
        measurements: {
          height: { value: 160, units: 'cm' },
          weight: { value: 70, units: 'kg' },
        },
      },
      measure_vitals,
    },
  })

  console.log(`Created patient for page: ${page_slug}`)
  return { ...result, task_node, encounter }
}

export async function* apcTaskNodes() {
  for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
    yield* tasksFromFilepath(file_path)
  }
}

async function createSamplePatientsForEachAPCPage() {
  const clinic = await createTestOrganization(db)

  const [nurse, shcp] = await Promise.all([
    addTestEmployeeWithSession(db, {
      role: 'nurse',
      specialty: 'Triage',
      organization_id: clinic.id,
    }),
    addTestEmployee(db, {
      role: 'nurse',
      specialty: 'Primary care',
      organization_id: clinic.id,
    }),
  ])

  await forEach(apcTaskNodes(), async (task_def) => {
    await setupTriageForAPCTaskNode(task_def, clinic, nurse, shcp)
  }, { concurrency: 1 })

  console.log('Done! Created sample patients for all APC pages.')
}

if (import.meta.main) {
  await createSamplePatientsForEachAPCPage()
  await db.destroy()
}
