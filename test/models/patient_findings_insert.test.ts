import { afterAll } from 'std/testing/bdd.ts'
import { type KyselyPlugin, PostgresQueryCompiler } from 'kysely'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { FindingNodeToInsert, NegativeFindingToInsert, patient_findings } from '../../db/models/patient_findings.ts'
import { patient_procedures } from '../../db/models/patient_procedures.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { FINDING_SITE, MEASUREMENT_FINDING, SEVERITY_SCORE, UNKNOWN_QUALIFIER, YES_QUALIFIER } from '../../shared/snomed_concepts.ts'
import { normalForm, parseWithSchema } from '../../shared/s_expression.ts'
import { insertable_finding_base, measurement_comparator } from '../../shared/s_expression_schemas.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VITALS_COMPUTED_SNOMED_CONCEPTS } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'
import { InsertedRecord } from '../../db/models/patient_findings.ts'
import { TrxOrDb } from '../../types.ts'

const WARNING_SIGNS_STEP = WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs
const MEASURE_VITALS_STEP = WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.measure_vitals

const BITE_WOUND_S_EXPRESSION = normalForm('(clinical_finding (snomed_concept "Bite - wound" "disorder"))')
const COUGH_S_EXPRESSION = normalForm('(clinical_finding (snomed_concept "Cough" "finding"))')
const CONSTIPATION_FINDING = normalForm('(clinical_finding (snomed_concept "Constipation" "finding"))')
const FEVER_S_EXPRESSION = normalForm('(clinical_finding (snomed_concept "Fever" "finding"))')
const CONSTIPATION_ONSET_S_EXPRESSION = `(>= (onset (active_condition (snomed_concept "Constipation" "finding"))) (time_ago 24 hours))`
const LOW_RESPIRATORY_RATE_S_EXPRESSION = `(< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)`

const RESPIRATORY_RATE_8 = `(= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 8)`

// The one record of a result that is expected to hold exactly one
function onlyRecord(records: InsertedRecord[]): InsertedRecord {
  assertEquals(records.length, 1)
  const record = records.find(() => true)
  assert(record)
  return record
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function positive(s_expression: string): FindingNodeToInsert {
  return parseWithSchema(s_expression, insertable_finding_base)
}

function negative(s_expression: string): NegativeFindingToInsert {
  const node = parseWithSchema(`(no ${s_expression})`, insertable_finding_base)
  return { ...node, existence: 'No', priority: null, score: undefined }
}

function unknown(s_expression: string): NegativeFindingToInsert {
  return {
    ...positive(s_expression),
    existence: 'Unknown',
    value_snomed_concept: { atom: 'snomed_concept', ...UNKNOWN_QUALIFIER },
    priority: null,
    score: undefined,
  }
}

function measurement(s_expression: string) {
  return parseWithSchema(s_expression, measurement_comparator)
}

/*
  The statements run through the returned handle, compiled to SQL. A plugin also sees every
  subquery as it is built, so only a query that was executed (has a result) is counted.
*/
function recordingDb() {
  const compiled = new Map<string, string>()
  const statements: string[] = []
  const compiler = new PostgresQueryCompiler()
  const plugin: KyselyPlugin = {
    transformQuery: ({ node, queryId }) => {
      compiled.set(queryId.queryId, compiler.compileQuery(node, queryId).sql)
      return node
    },
    transformResult: ({ result, queryId }) => {
      const sql = compiled.get(queryId.queryId)
      if (sql) statements.push(sql)
      return Promise.resolve(result)
    },
  }
  return { recording_db: db.withPlugin(plugin), statements }
}

async function setup(trx: TrxOrDb = db) {
  const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(trx)
  return {
    patient_id,
    patient_encounter_id,
    patient_encounter_employee_id: employee.patient_encounter_employee_id,
    employment_id: employee.employee_id,
    patient_age_determination: 'adult' as const,
    create_procedure: {
      create_with_specific_snomed_concept_id: WARNING_SIGNS_STEP.snomed_concept_id,
    },
  }
}

type Setup = Awaited<ReturnType<typeof setup>>

function common({ create_procedure, ...rest }: Setup) {
  return { ...rest, procedure: create_procedure }
}

function satisfiedDueTos(patient_record_id: string) {
  return db.selectFrom('patient_record_satisfying_due_tos')
    .innerJoin('due_to', 'due_to.id', 'patient_record_satisfying_due_tos.due_to_id')
    .where('patient_record_satisfying_due_tos.patient_record_id', '=', patient_record_id)
    .select('due_to.s_expression')
    .execute()
}

async function procedureIdsOfStep({ patient_encounter_id }: Setup, step_snomed_concept_id: string) {
  const procedures = await db.selectFrom('patient_procedures')
    .innerJoin('patient_records', 'patient_records.id', 'patient_procedures.id')
    .where('patient_records.patient_encounter_id', '=', patient_encounter_id)
    .where('patient_records.specific_snomed_concept_id', '=', step_snomed_concept_id)
    .select('patient_records.id')
    .execute()
  return procedures.map(({ id }) => id)
}

async function findingProcedureIds(ids: string[]) {
  const rows = await db.selectFrom('patient_findings')
    .where('id', 'in', ids)
    .select('procedure_id')
    .execute()
  return new Set(rows.map(({ procedure_id }) => procedure_id))
}

describeParallel('db/models/patient_findings.ts insert methods', () => {
  afterAll(() => db.destroy())

  describeParallel('insertManyNegative', () => {
    itParallel('inserts negative findings, existence No and Unknown, tagging nothing', async () => {
      const s = await setup()
      const { procedure_id, records } = await patient_findings.insertManyNegative(db, {
        ...common(s),
        findings: [negative(BITE_WOUND_S_EXPRESSION), unknown(COUGH_S_EXPRESSION), `(no ${FEVER_S_EXPRESSION})`],
      })
      assert(procedure_id)
      assertEquals(records.map((r) => r.existence), ['No', 'Unknown', 'No'])

      const tagged = await db.selectFrom('patient_record_satisfying_due_tos')
        .where('patient_record_id', 'in', records.map((r) => r.id))
        .select('due_to_id')
        .execute()
      assertEquals(tagged, [])
      assertEquals(await findingProcedureIds(records.map((r) => r.id)), new Set([procedure_id]))
    })

    itParallel('rejects a positive finding', async () => {
      const s = await setup()
      await assertRejects(
        () =>
          patient_findings.insertManyNegative(db, {
            ...common(s),
            // @ts-expect-error a positive finding is not a NegativeFindingToInsert
            findings: [negative(BITE_WOUND_S_EXPRESSION), positive(COUGH_S_EXPRESSION)],
          }),
        Error,
        'only inserts negative findings',
      )
    })

    itParallel('rejects a finding with a priority or a score', async () => {
      const s = await setup()
      await assertRejects(
        () =>
          patient_findings.insertManyNegative(db, {
            ...common(s),
            // @ts-expect-error a priority is not allowed on a negative finding
            findings: [{ ...negative(BITE_WOUND_S_EXPRESSION), priority: { level: 'Urgent', by_system: true } }],
          }),
        Error,
        'priority or score',
      )
      await assertRejects(
        () =>
          patient_findings.insertManyNegative(db, {
            ...common(s),
            // @ts-expect-error a score is not allowed on a negative finding
            findings: [{ ...negative(BITE_WOUND_S_EXPRESSION), score: { value: 1, evaluation_snomed_concept_id: SEVERITY_SCORE.id } }],
          }),
        Error,
        'priority or score',
      )
    })

    itParallel('rejects no findings', async () => {
      const s = await setup()
      await assertRejects(() => patient_findings.insertManyNegative(db, { ...common(s), findings: [] }), Error, 'at least one finding')
    })

    itParallel('honours a caller-supplied id', async () => {
      const s = await setup()
      const id = generateUUID()
      const { records } = await patient_findings.insertManyNegative(db, {
        ...common(s),
        findings: [{ ...negative(BITE_WOUND_S_EXPRESSION), id }],
      })
      assertEquals(records, [{ id, existence: 'No' }])
    })

    itParallel('persists qualifiers and attributes', async () => {
      const s = await setup()
      const { records } = await patient_findings.insertManyNegative(db, {
        ...common(s),
        findings: [
          `(no (clinical_finding (snomed_concept "Constipation" "finding") (qualifier (snomed_concept "Moderate" "qualifier value")) (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Intestinal structure" "body structure"))))`,
        ],
      })
      const qualified_by = await db.selectFrom('patient_record_qualifiers')
        .where('qualifies_record_id', '=', onlyRecord(records).id)
        .select('id')
        .execute()
      assertEquals(qualified_by.length, 2)
    })

    itParallel('writes a statement with no due_to matching, and does not look up the value', async () => {
      const s = await setup()
      const { recording_db, statements } = recordingDb()
      await patient_findings.insertManyNegative(recording_db, {
        ...common(s),
        findings: [negative(BITE_WOUND_S_EXPRESSION), unknown(COUGH_S_EXPRESSION)],
      })
      assertEquals(statements.length, 1)
      const [statement] = statements
      assert(statement.includes('inserting_records'))
      assert(!statement.includes('due_to'), 'a negative statement must not match due_tos')
      assert(!statement.includes('finding_site'), 'a negative statement must not join the finding_site tables')
      // Only the root and the specific concept of each of the two findings are looked up, not the value
      const concept_lookups = statement.split('snomed_inferred_canonical_name_and_category').length - 1
      assertEquals(concept_lookups, 4)
    })
  })

  describeParallel('insertOnePositive', () => {
    itParallel('tags the finding with the due_tos it satisfies within the inserting statement', async () => {
      const s = await setup()
      const { records } = await patient_findings.insertOnePositive(db, { ...common(s), finding: BITE_WOUND_S_EXPRESSION })
      assertEquals(onlyRecord(records).existence, 'Yes')
      const satisfying = await satisfiedDueTos(onlyRecord(records).id)
      assert(
        satisfying.some((row) => row.s_expression === BITE_WOUND_S_EXPRESSION),
        `Bite - wound should satisfy ${BITE_WOUND_S_EXPRESSION}, but only satisfied:\n${satisfying.map((row) => row.s_expression).join('\n')}`,
      )
    })

    itParallel('tags a finding whose onset event satisfies an event_time_comparison due_to', async () => {
      const s = await setup()
      const { records } = await patient_findings.insertOnePositive(db, {
        ...common(s),
        finding: `(clinical_finding (snomed_concept "Constipation" "finding") (event (snomed_concept "Time of onset" "observable entity") "${hoursAgo(48)}"))`,
      })
      const satisfying = await satisfiedDueTos(onlyRecord(records).id)
      assert(satisfying.some((row) => row.s_expression === CONSTIPATION_ONSET_S_EXPRESSION))
    })

    itParallel('rejects a negative finding', async () => {
      const s = await setup()
      await assertRejects(
        () => patient_findings.insertOnePositive(db, { ...common(s), finding: `(no ${BITE_WOUND_S_EXPRESSION})` }),
        Error,
        'only inserts positive findings',
      )
      await assertRejects(
        () => patient_findings.insertOnePositive(db, { ...common(s), finding: unknown(COUGH_S_EXPRESSION) }),
        Error,
        'only inserts positive findings',
      )
    })

    itParallel('writes the priority and score records', async () => {
      const s = await setup()
      const { records } = await patient_findings.insertOnePositive(db, {
        ...common(s),
        finding: {
          ...positive(BITE_WOUND_S_EXPRESSION),
          priority: { level: 'Urgent', by_system: true },
          score: { value: 2, evaluation_snomed_concept_id: SEVERITY_SCORE.id },
        },
      })
      const id = onlyRecord(records).id
      const priorities = await db.selectFrom('patient_record_relations')
        .innerJoin('patient_triage_level', 'patient_triage_level.id', 'patient_record_relations.source_id')
        .where('patient_record_relations.destination_id', '=', id)
        .select('patient_triage_level.id')
        .execute()
      assertEquals(priorities.length, 1)
      const scores = await db.selectFrom('patient_evaluations')
        .innerJoin('patient_evaluation_scores', 'patient_evaluation_scores.id', 'patient_evaluations.id')
        .where('patient_evaluations.evaluates_record_id', '=', id)
        .select('patient_evaluation_scores.score')
        .execute()
      assertEquals(scores.map(({ score }) => Number(score)), [2])
    })

    itParallel('works with if_not_already_exists, creating the procedure once', async () => {
      const s = await setup()
      const procedure = {
        procedure_id: patient_procedures.previouslyCompletedWorkflowStepQuery(db, {
          patient_encounter_id: s.patient_encounter_id,
          workflow_step_snomed_concept: WARNING_SIGNS_STEP,
        }),
        create_with_specific_snomed_concept_id: WARNING_SIGNS_STEP.snomed_concept_id,
        if_not_already_exists: true as const,
      }
      const first = await patient_findings.insertOnePositive(db, { ...common(s), procedure, finding: BITE_WOUND_S_EXPRESSION })
      const second = await patient_findings.insertOnePositive(db, { ...common(s), procedure, finding: COUGH_S_EXPRESSION })
      assertEquals(first.procedure_id, second.procedure_id)
      assertEquals(await procedureIdsOfStep(s, WARNING_SIGNS_STEP.snomed_concept_id), [first.procedure_id])
    })
  })

  describeParallel('insertMeasurements', () => {
    itParallel('tags a measurement with a due_to it satisfies', async () => {
      const s = await setup()
      const { procedure_id, records } = await patient_findings.insertMeasurements(db, {
        ...common(s),
        procedure: { create_with_specific_snomed_concept_id: MEASURE_VITALS_STEP.snomed_concept_id },
        measurements: [measurement(RESPIRATORY_RATE_8)],
      })
      assert(procedure_id)
      assertEquals(records.map((r) => r.existence), ['Yes'])
      const satisfying = await satisfiedDueTos(onlyRecord(records).id)
      assert(
        satisfying.some((row) => row.s_expression === LOW_RESPIRATORY_RATE_S_EXPRESSION),
        `A respiratory rate of 8 should satisfy ${LOW_RESPIRATORY_RATE_S_EXPRESSION}, but only satisfied:\n${
          satisfying.map((row) => row.s_expression).join('\n')
        }`,
      )
    })

    itParallel('writes the score and priority of a measurement', async () => {
      const s = await setup()
      const { records } = await patient_findings.insertMeasurements(db, {
        ...common(s),
        measurements: [{ ...measurement(RESPIRATORY_RATE_8), score: 3, priority: { level: 'Very urgent', by_system: true } }],
      })
      const id = onlyRecord(records).id
      const scores = await db.selectFrom('patient_evaluations')
        .innerJoin('patient_evaluation_scores', 'patient_evaluation_scores.id', 'patient_evaluations.id')
        .where('patient_evaluations.evaluates_record_id', '=', id)
        .select('patient_evaluation_scores.score')
        .execute()
      assertEquals(scores.map(({ score }) => Number(score)), [3])
      const priorities = await db.selectFrom('patient_record_relations')
        .innerJoin('patient_triage_level', 'patient_triage_level.id', 'patient_record_relations.source_id')
        .where('patient_record_relations.destination_id', '=', id)
        .select('patient_triage_level.id')
        .execute()
      assertEquals(priorities.length, 1)
    })

    itParallel('rejects no measurements', async () => {
      const s = await setup()
      await assertRejects(() => patient_findings.insertMeasurements(db, { ...common(s), measurements: [] }), Error, 'at least one measurement')
    })

    /*
      Measurements are only ever matched through the measurement branch of the due_to matching:
      no due_to is rooted at a Measurement finding and no vital has a Finding site in SNOMED.
      A future narrowing of the matching to that branch for measurements depends on this.
    */
    itParallel('guards the data invariant that a vital matches no due_to except by measurement', async () => {
      const vital_ids = [...Object.values(VITAL_MEASUREMENTS_SNOMED_CONCEPTS), ...Object.values(VITALS_COMPUTED_SNOMED_CONCEPTS)].map((c) => c.id)
      const finding_rooted = await db.selectFrom('due_to_findings')
        .where('root_snomed_concept_id', '=', MEASUREMENT_FINDING.id)
        .select('id')
        .execute()
      assertEquals(finding_rooted, [])
      const event_rooted = await db.selectFrom('due_to_event_time_comparisons')
        .where('root_snomed_concept_id', '=', MEASUREMENT_FINDING.id)
        .select('id')
        .execute()
      assertEquals(event_rooted, [])
      const with_finding_site = await db.selectFrom('snomed_relationship')
        .where('active', '=', true)
        .where('type_id', '=', FINDING_SITE.id)
        .where('source_id', 'in', vital_ids)
        .select('source_id')
        .execute()
      assertEquals(with_finding_site, [])
    })
  })

  describeParallel('insertMany', () => {
    itParallel('returns the legacy shape', async () => {
      const s = await setup()
      const id = generateUUID()
      const result = await patient_findings.insertMany(db, {
        ...common(s),
        findings: [{ ...positive(BITE_WOUND_S_EXPRESSION), id }],
        measurements: [measurement(RESPIRATORY_RATE_8)],
      })
      assertEquals(Object.keys(result).toSorted(), ['findings', 'measurements', 'procedure_id', 'success'])
      assertEquals(result.success, true)
      assertEquals(result.findings, [{ id, existence: 'Yes' }])
      assertEquals(result.measurements.map((m) => m.existence), ['Yes'])
    })

    itParallel("makes one statement, with the caller's procedure, for a single bucket", async () => {
      async function assertOneStatementUnderTheCallersProcedure(
        bucket: string,
        insert: (trx: TrxOrDb, s: Setup) => Promise<{ procedure_id: string }>,
      ) {
        const s = await setup()
        const { recording_db, statements } = recordingDb()
        const { procedure_id } = await insert(recording_db, s)
        assertEquals(statements.length, 1, `${bucket} should be a single statement, got:\n${statements.join('\n\n')}`)
        assertEquals(await procedureIdsOfStep(s, WARNING_SIGNS_STEP.snomed_concept_id), [procedure_id])
      }

      await assertOneStatementUnderTheCallersProcedure(
        'negatives',
        (trx, s) => patient_findings.insertMany(trx, { ...common(s), findings: [negative(BITE_WOUND_S_EXPRESSION), `(no ${COUGH_S_EXPRESSION})`] }),
      )
      await assertOneStatementUnderTheCallersProcedure(
        'one positive',
        (trx, s) => patient_findings.insertMany(trx, { ...common(s), findings: [BITE_WOUND_S_EXPRESSION] }),
      )
      await assertOneStatementUnderTheCallersProcedure(
        'measurements',
        (trx, s) => patient_findings.insertMany(trx, { ...common(s), findings: [], measurements: [measurement(RESPIRATORY_RATE_8)] }),
      )
    })

    itParallel('sends an all negative batch through the negative statement, with no due_to matching', async () => {
      const s = await setup()
      const { recording_db, statements } = recordingDb()
      const { findings } = await patient_findings.insertMany(recording_db, {
        ...common(s),
        findings: [`(no ${BITE_WOUND_S_EXPRESSION})`, unknown(COUGH_S_EXPRESSION), negative(FEVER_S_EXPRESSION)],
      })
      assertEquals(findings.map((f) => f.existence), ['No', 'Unknown', 'No'])
      assertEquals(statements.length, 1)
      assert(!statements.join().includes('due_to'))
    })

    itParallel('resolves the procedure once when it fans out, linking every record to it', async () => {
      const s = await setup()
      const { recording_db, statements } = recordingDb()
      const result = await patient_findings.insertMany(recording_db, {
        ...common(s),
        findings: [`(no ${BITE_WOUND_S_EXPRESSION})`, COUGH_S_EXPRESSION],
        measurements: [measurement(RESPIRATORY_RATE_8)],
      })
      // the procedure, the negatives, the positive and the measurements
      assertEquals(statements.length, 4)
      assertEquals(await procedureIdsOfStep(s, WARNING_SIGNS_STEP.snomed_concept_id), [result.procedure_id])
      const ids = [...result.findings, ...result.measurements].map((r) => r.id)
      assertEquals(ids.length, 3)
      assertEquals(await findingProcedureIds(ids), new Set([result.procedure_id]))
    })

    itParallel('creates exactly one procedure for two positives given a creation intent', async () => {
      const s = await setup()
      const result = await patient_findings.insertMany(db, {
        ...common(s),
        findings: [BITE_WOUND_S_EXPRESSION, COUGH_S_EXPRESSION, FEVER_S_EXPRESSION],
      })
      assertEquals(await procedureIdsOfStep(s, WARNING_SIGNS_STEP.snomed_concept_id), [result.procedure_id])
      assertEquals(await findingProcedureIds(result.findings.map((r) => r.id)), new Set([result.procedure_id]))
    })

    itParallel('resolves an if_not_already_exists intent once when it fans out', async () => {
      const s = await setup()
      const procedure = {
        procedure_id: patient_procedures.previouslyCompletedWorkflowStepQuery(db, {
          patient_encounter_id: s.patient_encounter_id,
          workflow_step_snomed_concept: WARNING_SIGNS_STEP,
        }),
        create_with_specific_snomed_concept_id: WARNING_SIGNS_STEP.snomed_concept_id,
        if_not_already_exists: true as const,
      }
      const first = await patient_findings.insertMany(db, { ...common(s), procedure, findings: [BITE_WOUND_S_EXPRESSION, COUGH_S_EXPRESSION] })
      const second = await patient_findings.insertMany(db, { ...common(s), procedure, findings: [`(no ${FEVER_S_EXPRESSION})`, COUGH_S_EXPRESSION] })
      assertEquals(second.procedure_id, first.procedure_id)
      assertEquals(await procedureIdsOfStep(s, WARNING_SIGNS_STEP.snomed_concept_id), [first.procedure_id])
    })

    itParallel('returns the findings in submission order', async () => {
      const s = await setup()
      const a = generateUUID()
      const b = generateUUID()
      const c = generateUUID()
      const d = generateUUID()
      const e = generateUUID()
      const result = await patient_findings.insertMany(db, {
        ...common(s),
        findings: [
          { ...negative(BITE_WOUND_S_EXPRESSION), id: a },
          { ...positive(COUGH_S_EXPRESSION), id: b },
          { ...unknown(FEVER_S_EXPRESSION), id: c },
          { ...positive(CONSTIPATION_FINDING), id: d },
          { ...negative(CONSTIPATION_FINDING), id: e },
        ],
        measurements: [measurement(RESPIRATORY_RATE_8)],
      })
      assertEquals(result.findings, [
        { id: a, existence: 'No' },
        { id: b, existence: 'Yes' },
        { id: c, existence: 'Unknown' },
        { id: d, existence: 'Yes' },
        { id: e, existence: 'No' },
      ])
    })

    itParallel('classifies by value, not by the existence field alone', async () => {
      const s = await setup()
      // Yes stored as a value, as brief_history does
      const yes = {
        ...positive(BITE_WOUND_S_EXPRESSION),
        value_snomed_concept: { atom: 'snomed_concept' as const, ...YES_QUALIFIER },
      }
      const result = await patient_findings.insertMany(db, { ...common(s), findings: [yes, negative(COUGH_S_EXPRESSION)] })
      assertEquals(result.findings.map((f) => f.existence), ['Yes', 'No'])
    })

    itParallel('routes a negative finding carrying a priority to insertOnePositive, which rejects it', async () => {
      const s = await setup()
      await assertRejects(
        () =>
          patient_findings.insertMany(db, {
            ...common(s),
            findings: [{ ...negative(BITE_WOUND_S_EXPRESSION), priority: { level: 'Urgent', by_system: true } }],
          }),
        Error,
        'only inserts positive findings',
      )
    })

    itParallel('treats a null priority as no priority', async () => {
      const s = await setup()
      const { recording_db, statements } = recordingDb()
      await patient_findings.insertMany(recording_db, {
        ...common(s),
        findings: [{ ...negative(BITE_WOUND_S_EXPRESSION), priority: null }],
      })
      assert(!statements.join().includes('due_to'))
    })

    itParallel('rejects an empty input', async () => {
      const s = await setup()
      await assertRejects(() => patient_findings.insertMany(db, { ...common(s), findings: [] }), Error, 'at least one finding or measurement')
    })
  })
})
