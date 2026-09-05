import type { IPostgresInterval } from 'postgres-interval'
import { define } from '../define.ts'
import { TASKS } from '../../../shared/tasks.ts'
import { assert } from 'std/assert/assert.ts'
import { sql } from 'kysely'
import { snomedConceptId } from '../../models/s_expression_snomed_concepts.ts'
import { inverseSExpression } from '../../../shared/s_expression_inverse.ts'
import { TrxOrDb } from '../../../types.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { ALL_RULES, DueToEntry, DueToInsert, dueToInsert } from '../../../shared/rules.ts'
import { SYSTEM_DIAGNOSIS_RULES_PARSED } from '../../../shared/system_diagnosis_rules.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_PARSED } from '../../../shared/system_priority_evaluations.ts'

export default define([
  'rules',
  'due_to',
  'due_to_findings',
  'due_to_finding_sites',
  'due_to_measurements',
  'due_to_event_time_comparisons',
  'rule_due_to',
  'tasks',
  'system_diagnosis_rules',
  'system_priority_evaluations',
], async (trx: TrxOrDb) => {
  // Step 1: Collect all due_to inserts keyed by s_expression, merging age_determinations
  const due_to_map = new Map<string, DueToEntry>()

  for (const rule of ALL_RULES) {
    const inserts = dueToInsert(rule.due_to)
    assert(inserts.length, `Rule "${rule.description}" produced no due_to inserts`)
    for (const insert of inserts) {
      const existing = due_to_map.get(insert.s_expression)
      if (existing) {
        for (const age of rule.ages) {
          if (!existing.age_determinations.includes(age)) {
            existing.age_determinations.push(age)
          }
        }
      } else {
        due_to_map.set(insert.s_expression, {
          s_expression: insert.s_expression,
          age_determinations: [...rule.ages],
          insert,
        })
      }
    }
  }

  const due_to_entries = [...due_to_map.values()]
  const due_to_findings = due_to_entries.filter((e): e is DueToEntry & { insert: Extract<DueToInsert, { type: 'finding' }> } => e.insert.type === 'finding')
  const due_to_finding_sites = due_to_entries.filter((e): e is DueToEntry & { insert: Extract<DueToInsert, { type: 'finding_site' }> } =>
    e.insert.type === 'finding_site'
  )
  const due_to_measurements = due_to_entries.filter((e): e is DueToEntry & { insert: Extract<DueToInsert, { type: 'measurement' }> } =>
    e.insert.type === 'measurement'
  )
  const due_to_event_time_comparisons = due_to_entries.filter((e): e is DueToEntry & { insert: Extract<DueToInsert, { type: 'event_time_comparison' }> } =>
    e.insert.type === 'event_time_comparison'
  )

  // Step 2: Upsert all due_to rows, letting the DB generate/return ids
  const inserted_due_tos = await trx.insertInto('due_to')
    .values(due_to_entries.map((e) => ({
      s_expression: e.s_expression,
      age_determinations: e.age_determinations,
      history: e.insert.history,
    })))
    .onConflict((oc) =>
      oc.column('s_expression').doUpdateSet({
        age_determinations: sql`array(SELECT DISTINCT unnest(excluded.age_determinations || due_to.age_determinations))::age_determination[]`,
      })
    )
    .returning(['id', 's_expression'])
    .execute()

  const due_to_id_by_s_expression = new Map(inserted_due_tos.map((r) => [r.s_expression, r.id]))

  // console.log({due_to_findings})
  // Insert due_to_findings
  if (due_to_findings.length) {
    await trx.insertInto('due_to_findings')
      .values(due_to_findings.map((e) => ({
        id: due_to_id_by_s_expression.get(e.s_expression)!,
        root_snomed_concept_id: e.insert.root_snomed_concept ? snomedConceptId(e.insert.root_snomed_concept) : null,
        specific_snomed_concept_id: snomedConceptId(e.insert.specific_snomed_concept),
        value_snomed_concept_id: e.insert.value_snomed_concept ? snomedConceptId(e.insert.value_snomed_concept) : null,
        is_somehow_qualified: e.insert.is_somehow_qualified,
      })))
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          root_snomed_concept_id: (eb) => eb.ref('excluded.root_snomed_concept_id'),
          specific_snomed_concept_id: (eb) => eb.ref('excluded.specific_snomed_concept_id'),
          value_snomed_concept_id: (eb) => eb.ref('excluded.value_snomed_concept_id'),
          is_somehow_qualified: (eb) => eb.ref('excluded.is_somehow_qualified'),
        })
      )
      .execute()
  }

  // Insert due_to_finding_sites
  if (due_to_finding_sites.length) {
    await trx.insertInto('due_to_finding_sites')
      .values(due_to_finding_sites.map((e) => ({
        id: due_to_id_by_s_expression.get(e.s_expression)!,
        value_snomed_concept_id: snomedConceptId(e.insert.value_snomed_concept),
        is_somehow_qualified: e.insert.is_somehow_qualified,
      })))
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          value_snomed_concept_id: (eb) => eb.ref('excluded.value_snomed_concept_id'),
          is_somehow_qualified: (eb) => eb.ref('excluded.is_somehow_qualified'),
        })
      )
      .execute()
  }

  // Insert due_to_measurements
  if (due_to_measurements.length) {
    await trx.insertInto('due_to_measurements')
      .values(due_to_measurements.map((e) => ({
        id: due_to_id_by_s_expression.get(e.s_expression)!,
        root_snomed_concept_id: null,
        specific_snomed_concept_id: snomedConceptId(e.insert.specific_snomed_concept),
        comparator: e.insert.comparator,
        value: e.insert.value,
      })))
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          specific_snomed_concept_id: (eb) => eb.ref('excluded.specific_snomed_concept_id'),
          comparator: (eb) => eb.ref('excluded.comparator'),
          value: (eb) => eb.ref('excluded.value'),
        })
      )
      .execute()
  }

  // Insert due_to_event_time_comparisons
  if (due_to_event_time_comparisons.length) {
    await trx.insertInto('due_to_event_time_comparisons')
      .values(due_to_event_time_comparisons.map((e) => ({
        id: due_to_id_by_s_expression.get(e.s_expression)!,
        event_snomed_concept_id: snomedConceptId(e.insert.event_snomed_concept),
        root_snomed_concept_id: e.insert.root_snomed_concept ? snomedConceptId(e.insert.root_snomed_concept) : null,
        specific_snomed_concept_id: snomedConceptId(e.insert.specific_snomed_concept),
        comparator: e.insert.comparator,
        duration: sql<IPostgresInterval>`${`${e.insert.duration.value} ${e.insert.duration.units}`}::interval`,
      })))
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          event_snomed_concept_id: (eb) => eb.ref('excluded.event_snomed_concept_id'),
          root_snomed_concept_id: (eb) => eb.ref('excluded.root_snomed_concept_id'),
          specific_snomed_concept_id: (eb) => eb.ref('excluded.specific_snomed_concept_id'),
          comparator: (eb) => eb.ref('excluded.comparator'),
          duration: (eb) => eb.ref('excluded.duration'),
        })
      )
      .execute()
  }

  // Step 3: Insert rules and their specific tables, then rule_due_to
  const rule_ids: string[] = []
  const rule_due_to_rows: { rule_id: string; due_to_id: string; always_applies_if_present: boolean }[] = []

  for (const rule of TASKS) {
    console.log(`Inserting task ${rule.description}...`)
    const rule_id = rule.description
    rule_ids.push(rule_id)

    await trx.insertInto('rules')
      .values({
        id: rule_id,
        description: rule.description,
        age_determinations: rule.ages,
        due_to_s_expression: inverseSExpression(rule.due_to),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          description: (eb) => eb.ref('excluded.description'),
          age_determinations: (eb) => eb.ref('excluded.age_determinations'),
          due_to_s_expression: (eb) => eb.ref('excluded.due_to_s_expression'),
        })
      )
      .execute()

    await trx.insertInto('tasks')
      .values({
        id: rule_id,
        to_be_done_s_expression: inverseSExpression(rule.to_be_done),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          to_be_done_s_expression: (eb) => eb.ref('excluded.to_be_done_s_expression'),
        })
      )
      .execute()

    for (const insert of dueToInsert(rule.due_to)) {
      rule_due_to_rows.push({
        rule_id,
        due_to_id: due_to_id_by_s_expression.get(insert.s_expression)!,
        always_applies_if_present: insert.always_applies_if_present,
      })
    }
  }

  for (const rule of SYSTEM_PRIORITY_EVALUATIONS_PARSED) {
    console.log(`Inserting system_priority_evaluation ${rule.description}...`)
    const rule_id = rule.description
    rule_ids.push(rule_id)

    await trx.insertInto('rules')
      .values({
        id: rule_id,
        description: rule.description,
        age_determinations: rule.ages,
        due_to_s_expression: inverseSExpression(rule.due_to),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          description: (eb) => eb.ref('excluded.description'),
          age_determinations: (eb) => eb.ref('excluded.age_determinations'),
          due_to_s_expression: (eb) => eb.ref('excluded.due_to_s_expression'),
        })
      )
      .execute()

    await trx.insertInto('system_priority_evaluations')
      .values({
        id: rule_id,
        priority: rule.priority,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          priority: (eb) => eb.ref('excluded.priority'),
        })
      )
      .execute()

    for (const insert of dueToInsert(rule.due_to)) {
      rule_due_to_rows.push({
        rule_id,
        due_to_id: due_to_id_by_s_expression.get(insert.s_expression)!,
        always_applies_if_present: insert.always_applies_if_present,
      })
    }
  }

  for (const rule of SYSTEM_DIAGNOSIS_RULES_PARSED) {
    console.log(`Inserting system_diagnosis_rule ${rule.description}...`)
    const rule_id = rule.description
    rule_ids.push(rule_id)

    await trx.insertInto('rules')
      .values({
        id: rule_id,
        description: rule.description,
        age_determinations: rule.ages,
        due_to_s_expression: inverseSExpression(rule.due_to),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          description: (eb) => eb.ref('excluded.description'),
          age_determinations: (eb) => eb.ref('excluded.age_determinations'),
          due_to_s_expression: (eb) => eb.ref('excluded.due_to_s_expression'),
        })
      )
      .execute()

    await trx.insertInto('system_diagnosis_rules')
      .values({
        id: rule_id,
        snomed_concept_id: snomedConceptId(rule.diagnosis.snomed_concept),
        certainty: rule.diagnosis.certainty_qualifier,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          snomed_concept_id: (eb) => eb.ref('excluded.snomed_concept_id'),
          certainty: (eb) => eb.ref('excluded.certainty'),
        })
      )
      .execute()

    for (const insert of dueToInsert(rule.due_to)) {
      rule_due_to_rows.push({
        rule_id,
        due_to_id: due_to_id_by_s_expression.get(insert.s_expression)!,
        always_applies_if_present: insert.always_applies_if_present,
      })
    }
  }

  // Insert all rule_due_to rows (deduplicate by rule_id + due_to_id)
  const rule_due_to_rows_by_key = new Map<string, typeof rule_due_to_rows[number]>()
  for (const row of rule_due_to_rows) {
    const key = `${row.rule_id}:${row.due_to_id}`
    const existing = rule_due_to_rows_by_key.get(key)
    if (!existing) {
      rule_due_to_rows_by_key.set(key, row)
      continue
    }
    assertEquals(
      existing.always_applies_if_present,
      row.always_applies_if_present,
      `Conflicting always_applies_if_present for rule_id=${row.rule_id} due_to_id=${row.due_to_id}`,
    )
  }
  const inserted_rule_due_to = await trx.insertInto('rule_due_to')
    .values([...rule_due_to_rows_by_key.values()])
    .onConflict((oc) =>
      oc.columns(['rule_id', 'due_to_id']).doUpdateSet({
        always_applies_if_present: (eb) => eb.ref('excluded.always_applies_if_present'),
      })
    )
    .returning('id')
    .execute()

  const rule_due_to_ids = inserted_rule_due_to.map((r) => r.id)
  const due_to_ids = inserted_due_tos.map((r) => r.id)

  // Clean up any rows that were not part of this run
  await trx.deleteFrom('rule_due_to')
    .where('id', 'not in', rule_due_to_ids)
    .execute()
  await trx.deleteFrom('due_to')
    .where('id', 'not in', due_to_ids)
    .execute()
  await trx.deleteFrom('rules')
    .where('id', 'not in', rule_ids)
    .execute()
}, { never_dump: true, always_run: true })
