import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { InsertObject, sql } from 'kysely'
import {
  HealthWorkerOrganization,
  IdSelection,
  Maybe,
  PostgresInterval,
  RenderedOrganization,
  RenderedPatientEncounter,
  RenderedPatientEncounterEmployee,
  RenderedPatientEncounterStatus,
  RenderedPatientOpenEncounter,
  RenderedPatientPresence,
  SelectShape,
  TrxOrDb,
  WorkflowStatus,
} from '../../types.ts'
import { patients } from './patients.ts'
import { employees } from './employees.ts'
import { patient_encounter_employees } from './patient_encounter_employees.ts'
import { organizations } from './organizations.ts'

import {
  asText,
  blankSelection,
  jsonArrayFrom,
  jsonArrayFromColumn,
  jsonObjectFrom,
  literalLocation,
  now,
  orderByArrayPosition,
  success_true,
} from '../helpers.ts'
import { DB, EncounterReason, PatientPresence, Workflow } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID, { isUUID } from '../../util/uuid.ts'
import { base, QueryResult } from './_base.ts'
import { assertDepartment } from '../../shared/departments.ts'
import { arrayIsEmpty, arrayIsNonEmpty, assertArrayEmpty, assertArrayNonEmpty } from '../../util/arraySize.ts'
import { canPerform, isWorkflow, WORKFLOW_STEPS } from '../../shared/workflow.ts'
import { assertAll } from '../../util/assertAll.ts'
import first from '../../util/first.ts'
import { health_workers } from './health_workers.ts'
import { makeAssertion } from '../../util/makeAssertion.ts'
import matching from '../../util/matching.ts'
import { exists } from '../../util/exists.ts'
import { organization_rooms } from './organization_rooms.ts'
import { isPriority, PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'
import { PRIORITY } from '../../shared/snomed_concepts.ts'
import { groupBy } from '../../util/groupBy.ts'
import sortBy from '../../util/sortBy.ts'
import last from '../../util/last.ts'

type EncounterExistingOrToCreate = {
  create: false
  patient_encounter_id: string
  existing: RenderedPatientEncounter
} | {
  create: true
  patient_encounter_id: string
  to_create: {
    reason: EncounterReason
    notes?: Maybe<string>
    appointment_id?: Maybe<string>
  }
}

type EncounterSearch = {
  is_open?: boolean
  is_closed?: boolean
  organization_id?: string
  patient_id?: string
  // ever_seen_health_worker_id?: string
  presence_health_worker_id?: string | IdSelection
}

function baseQuery(trx: TrxOrDb, opts: EncounterSearch) {
  return trx
    .selectFrom('patient_encounters')
    .select((eb_encounters) => [
      'patient_encounters.id as patient_encounter_id',
      'patient_encounters.created_at as arrived_timestamp',
      'patient_encounters.closed_at',
      'patient_encounters.reason',
      'patient_encounters.notes',
      jsonObjectFrom(
        patients.baseQuery(trx)
          .where(
            'patients.id',
            '=',
            eb_encounters.ref('patient_encounters.patient_id'),
          ),
      ).$notNull().as('patient'),
      jsonObjectFrom(
        organizations.baseQuery(trx, {})
          .where(
            'organizations.id',
            '=',
            eb_encounters.ref('patient_encounters.organization_id'),
          ),
      ).as('organization'),
      jsonObjectFrom(
        eb_encounters.selectFrom('appointments')
          .whereRef('appointments.id', '=', 'patient_encounters.appointment_id')
          .select((eb_appointments) => [
            'appointments.id',
            'appointments.start',
            jsonArrayFrom(
              employees.baseQuery(trx, {})
                .innerJoin(
                  'appointment_providers',
                  'appointment_providers.provider_id',
                  'employment.id',
                )
                .where(
                  'appointment_providers.appointment_id',
                  '=',
                  eb_appointments.ref('appointments.id'),
                ),
            ).as('providers'),
          ]),
      ).as('appointment'),
      sql<
        PostgresInterval
      >`(current_timestamp - patient_encounters.created_at)::interval`
        .as('wait_time'),

      jsonObjectFrom(
        eb_encounters.selectFrom('patient_triage_level')
          .innerJoin(
            'patient_records',
            'patient_triage_level.id',
            'patient_records.id',
          )
          .innerJoin(
            'patient_records_still_valid',
            'patient_records.id',
            'patient_records_still_valid.id',
          )
          .innerJoin(
            'snomed_inferred_canonical_name_and_category',
            'patient_records.value_snomed_concept_id',
            'snomed_inferred_canonical_name_and_category.id',
          )
          .whereRef(
            'patient_records.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .select((eb_patient_triage_level) => [
            asText(
              eb_patient_triage_level,
              'patient_records.specific_snomed_concept_id',
            ).as('specific_snomed_concept_id'),
            asText(
              eb_patient_triage_level,
              'patient_records.value_snomed_concept_id',
            ).as('value_snomed_concept_id'),
            'snomed_inferred_canonical_name_and_category.name',
            'patient_triage_level.target_treatment_time',
          ])
          .orderBy((eb_triage_level) =>
            orderByArrayPosition(
              eb_triage_level,
              'patient_records.value_snomed_concept_id',
              [
                PRIORITY_SNOMED_CODES['Emergency'],
                PRIORITY_SNOMED_CODES['Very urgent'],
                PRIORITY_SNOMED_CODES['Urgent'],
                PRIORITY_SNOMED_CODES['Non-urgent'],
              ],
            ), 'desc')
          .limit(1),
      ).as('priority'),
      jsonObjectFrom(
        eb_encounters.selectFrom('patient_presence')
          .innerJoin(
            'organization_rooms',
            'organization_rooms.id',
            'patient_presence.organization_room_id',
          )
          .where('patient_encounters.closed_at', 'is', null)
          .whereRef('patient_encounters.patient_id', '=', 'patient_presence.id')
          .select((eb_patient_presence) => [
            'patient_presence.organization_id',
            'patient_presence.department_name',
            'patient_presence.current_workflow',
            'patient_presence.next_workflow',
            jsonArrayFromColumn(
              'patient_encounter_employee_id',
              eb_patient_presence.selectFrom('employment_presence')
                .innerJoin(
                  'patient_encounter_employees',
                  'employment_presence.id',
                  'patient_encounter_employees.employment_id',
                )
                .whereRef(
                  'employment_presence.with_patient_id',
                  '=',
                  'patient_presence.id',
                )
                .whereRef(
                  'patient_encounter_employees.patient_encounter_id',
                  '=',
                  'patient_encounters.id',
                )
                .where('employment_presence.with_patient_id', 'is not', null)
                .select(
                  'patient_encounter_employees.id as patient_encounter_employee_id',
                ),
            ).as('present_with_patient_encounter_employee_ids'),
            jsonArrayFrom(
              eb_patient_presence.selectFrom('employment_presence')
                .innerJoin(
                  'patient_encounter_employees',
                  'employment_presence.id',
                  'patient_encounter_employees.employment_id',
                )
                .whereRef(
                  'employment_presence.with_patient_id',
                  '=',
                  'patient_presence.id',
                )
                .whereRef(
                  'patient_encounter_employees.patient_encounter_id',
                  '=',
                  'patient_encounters.id',
                )
                .where('employment_presence.with_patient_id', 'is not', null)
                .select([
                  'patient_encounter_employees.id as patient_encounter_employee_id',
                  'patient_encounter_employees.employment_id',
                ]),
            ).as('xyz'),
            jsonObjectFrom(
              eb_patient_presence.selectFrom('organization_rooms as room')
                .whereRef(
                  'room.id',
                  '=',
                  'patient_presence.organization_room_id',
                )
                .select(['room.id', 'room.name']),
            ).$notNull().as('room'),
          ])
          .limit(1),
      ).as('patient_presence'),
      jsonArrayFrom(
        eb_encounters.selectFrom('patient_workflows')
          .whereRef(
            'patient_workflows.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .leftJoin(
            'patient_workflows_completed',
            'patient_workflows.id',
            'patient_workflows_completed.id',
          )
          .select((eb_patient_workflows) => [
            'patient_workflows.id as patient_workflow_id',
            'patient_workflows.workflow',
            'patient_workflows_completed.created_at as completed_at',
            jsonArrayFromColumn(
              'step',
              eb_patient_workflows.selectFrom(
                'patient_workflow_steps_completed',
              )
                .innerJoin(
                  'workflow_steps',
                  'workflow_steps.workflow_step',
                  'patient_workflow_steps_completed.workflow_step',
                )
                .whereRef(
                  'patient_workflow_steps_completed.patient_workflow_id',
                  '=',
                  'patient_workflows.id',
                ).orderBy('order', 'asc')
                .select('step'),
            ).as('steps_completed'),
            jsonArrayFromColumn(
              'patient_encounter_employee_id',
              eb_patient_workflows.selectFrom(
                'patient_workflows_started',
              )
                .whereRef(
                  'patient_workflows_started.patient_workflow_id',
                  '=',
                  'patient_workflows.id',
                )
                .select('patient_encounter_employee_id').distinct(),
            ).as('seen_patient_encounter_employee_ids'),
          ]),
      ).as('workflows'),
      jsonArrayFrom(
        patient_encounter_employees.baseQuery(trx)
          .where(
            'patient_encounter_employees.patient_encounter_id',
            '=',
            eb_encounters.ref('patient_encounters.id'),
          ),
      ).as('all_employees_seen'),
    ])
    .$if(!!opts.is_open, (qb) => qb.where('patient_encounters.closed_at', 'is', null))
    .$if(!!opts.is_closed, (qb) => qb.where('patient_encounters.closed_at', 'is not', null))
    .$if(!!opts.organization_id, (qb) => qb.where('patient_encounters.organization_id', '=', opts.organization_id!))
    .$if(!!opts.patient_id, (qb) => qb.where('patient_encounters.patient_id', '=', opts.patient_id!))
    .$if(!!opts.presence_health_worker_id, (qb) =>
      qb.innerJoin(
        'employment_presence',
        'employment_presence.with_patient_id',
        'patient_encounters.patient_id',
      ).innerJoin(
        'employment',
        'employment.id',
        'employment_presence.id',
      ).where(
        'employment.health_worker_id',
        '=',
        opts.presence_health_worker_id!,
      ))
}

type IntermediatePatientEncounterResult = QueryResult<typeof baseQuery>

function asPriority(
  priority: IntermediatePatientEncounterResult['priority'],
): RenderedPatientEncounter['priority'] {
  if (!priority) return priority
  const { name, specific_snomed_concept_id, value_snomed_concept_id, ...rest } = priority
  assert(isPriority(name))
  assertEquals(specific_snomed_concept_id, PRIORITY.id)
  assert(value_snomed_concept_id)
  return { name, value_snomed_concept_id, ...rest }
}

function asWorkflowStatus(
  {
    patient_workflow_id,
    workflow,
    completed_at,
    steps_completed,
    seen_patient_encounter_employee_ids,
  }: IntermediatePatientEncounterResult['workflows'][0],
  status: RenderedPatientEncounterStatus,
): WorkflowStatus {
  assert(isWorkflow(workflow))
  const workflow_steps = WORKFLOW_STEPS[workflow]
  if (completed_at) {
    assertArrayNonEmpty(seen_patient_encounter_employee_ids, '1')
    assertEquals(workflow_steps, steps_completed)
    return {
      patient_workflow_id,
      workflow,
      status: 'completed',
      steps_completed,
      seen_patient_encounter_employee_ids,
      completed_at,
    }
  }

  assertNotEquals(workflow_steps, steps_completed)

  if (!status.open) {
    if (arrayIsEmpty(seen_patient_encounter_employee_ids)) {
      assertArrayEmpty(steps_completed, 'steps_completed')
      return {
        patient_workflow_id,
        workflow,
        status: 'not started',
        steps_completed,
        seen_patient_encounter_employee_ids,
      }
    }
    assertArrayNonEmpty(seen_patient_encounter_employee_ids, '2')
    return {
      patient_workflow_id,
      workflow,
      status: 'incomplete',
      steps_completed,
      seen_patient_encounter_employee_ids,
    }
  }

  if (
    status.patient_presence.current_workflow === workflow &&
    arrayIsNonEmpty(seen_patient_encounter_employee_ids)
  ) {
    return {
      patient_workflow_id,
      workflow,
      status: 'in progress',
      steps_completed,
      seen_patient_encounter_employee_ids,
    }
  }

  if (arrayIsEmpty(seen_patient_encounter_employee_ids)) {
    assertArrayEmpty(steps_completed, 'steps_completed')
    return {
      patient_workflow_id,
      workflow,
      status: 'not started',
      steps_completed,
      seen_patient_encounter_employee_ids,
    }
  }

  assertArrayNonEmpty(seen_patient_encounter_employee_ids, '4')
  return {
    patient_workflow_id,
    workflow,
    status: 'incomplete',
    steps_completed,
    seen_patient_encounter_employee_ids,
  }
}

function asWorkflows(
  workflows_array: IntermediatePatientEncounterResult['workflows'],
  status: RenderedPatientEncounterStatus,
): RenderedPatientEncounter['workflows'] {
  const workflows: RenderedPatientEncounter['workflows'] = {}
  const by_workflow = groupBy(workflows_array, 'workflow')
  for (const [workflow, workflow_items] of by_workflow.entries()) {
    const using_workflow = workflow_items.find((w) => !w.completed_at) ||
      last(sortBy(workflow_items, 'completed_at'))!
    workflows[workflow] = asWorkflowStatus(using_workflow, status)
  }
  return workflows
}

function asPatientPresence(
  {
    department_name,
    current_workflow,
    next_workflow,
    present_with_patient_encounter_employee_ids,
    room,
  }: NonNullable<
    IntermediatePatientEncounterResult['patient_presence']
  >,
): RenderedPatientPresence {
  assertDepartment(department_name)

  if (department_name === 'Waiting room') {
    assert(!current_workflow)
    assert(next_workflow)
    assertArrayEmpty(
      present_with_patient_encounter_employee_ids,
      'present_with_patient_encounter_employee_ids',
    )
    return {
      department_name,
      current_workflow,
      next_workflow,
      present_with_patient_encounter_employee_ids,
      room,
    }
  }

  assert(current_workflow)
  return {
    department_name,
    current_workflow,
    next_workflow,
    present_with_patient_encounter_employee_ids,
    room,
  }
}

function asStatus(
  patient_presence: IntermediatePatientEncounterResult['patient_presence'],
  closed_at: IntermediatePatientEncounterResult['closed_at'],
): RenderedPatientEncounterStatus {
  if (closed_at) {
    assert(!patient_presence)
    return { open: false, closed_at }
  }
  assert(patient_presence)
  return { open: true, patient_presence: asPatientPresence(patient_presence) }
}

export const patient_encounters = base({
  top_level_table: 'patient_encounters',
  baseQuery,
  formatResult: (
    {
      workflows,
      organization,
      priority,
      patient_presence,
      closed_at,
      patient,
      reason,
      all_employees_seen,
      ...patient_encounter
    },
  ): RenderedPatientEncounter => {
    assert(organization)
    assertAll(
      all_employees_seen,
      makeAssertion(health_workers.isEmployed),
    )

    const status = asStatus(patient_presence, closed_at)

    return {
      organization,
      workflows: asWorkflows(workflows, status),
      priority: asPriority(priority),
      all_employees_seen: all_employees_seen.map((employee) => {
        assertArrayNonEmpty(employee.organizations)
        return employee as RenderedPatientEncounterEmployee
      }),
      status,
      patient,
      reason,
      ...patient_encounter,
    }
  },
  async insertSeekingTreatmentForRegisteredPatient(
    trx: TrxOrDb,
    organization: RenderedOrganization,
    organization_employment: HealthWorkerOrganization,
    {
      patient_id,
      encounter,
    }: {
      patient_id: string
      encounter: EncounterExistingOrToCreate
    },
  ): Promise<SelectShape<PatientPresence>> {
    const { patient_encounter_id } = encounter
    assert(
      isUUID(patient_encounter_id),
      'Caller must supply uuid upon creation',
    )

    const { location, id: organization_id } = organization
    assert(
      location,
      'Can only add encounters for organizations with a location',
    )

    const patient_encounter_employee_id = encounter.create ? generateUUID() : patient_encounter_employees.seenPatientEncounterEmployeeId(
      encounter.existing,
      organization_employment,
    )

    assert(
      patient_encounter_employee_id,
      'Caller must supply patient_encounter_employee_id if not created',
    )

    const { reason } = encounter.create ? encounter.to_create : encounter.existing
    assertEquals(
      reason,
      'seeking treatment',
      'Only seeking treatment supported for now!',
    )

    const workflows: Workflow[] = ['triage', 'consultation']
    const patient_workflows = workflows.map((workflow) => ({
      id: generateUUID(),
      patient_encounter_id,
      workflow,
    }))

    const department_name = 'Triage'

    const employed_in_workflow_department = canPerform(organization_employment, workflows[0])

    let with_patient_id: string | null = null
    let patient_presence: InsertObject<DB, 'patient_presence'> = {
      id: patient_id,
      organization_id,
      patient_encounter_id,
      current_workflow: null,
      next_workflow: workflows[0],
      department_name: 'Waiting room',
      organization_room_id: exists(organization.waiting_room_id),
    }

    if (employed_in_workflow_department) {
      const first_available_room = await organization_rooms.findFirstOptional(
        trx,
        { organization_id, department_name, is_available: true },
      )
      if (first_available_room) {
        with_patient_id = patient_id
        patient_presence = {
          id: patient_id,
          organization_id,
          patient_encounter_id,
          current_workflow: workflows[0],
          next_workflow: workflows[1],
          department_name,
          organization_room_id: first_available_room.id,
        }
      }
    }

    const employment_presence: InsertObject<DB, 'employment_presence'> = {
      id: organization_employment.employment_id,
      at_work: true,
      with_patient_id,
    }

    const { completed_registration, ...inserted_patient_presence } = await trx
      .with(
        'inserting_patient_encounter',
        (qb) =>
          encounter.create
            ? qb.insertInto('patient_encounters')
              .values({
                patient_id,
                reason,
                id: patient_encounter_id,
                notes: encounter.to_create.notes,
                appointment_id: encounter.to_create.appointment_id,
                organization_id: organization.id,
                location: literalLocation(location),
              })
            : blankSelection(qb),
      ).with(
        'inserting_patient_encounter_employee',
        (qb) =>
          encounter.create
            ? qb.insertInto('patient_encounter_employees')
              .values({
                patient_encounter_id,
                id: patient_encounter_employee_id,
                employment_id: organization_employment.employment_id,
              })
            : blankSelection(qb),
      ).with(
        'inserting_patient_workflows',
        (qb) =>
          qb.insertInto('patient_workflows')
            .values(patient_workflows),
      )
      .with(
        'inserting_patient_workflows_started',
        (qb) =>
          employed_in_workflow_department
            ? qb.insertInto('patient_workflows_started')
              .values({
                patient_workflow_id: patient_workflows[0].id,
                patient_encounter_employee_id,
              })
            : blankSelection(qb),
      )
      .with(
        'inserting_patient_presence',
        (qb) =>
          qb.insertInto('patient_presence')
            .values(patient_presence).onConflict((oc) => oc.column('id').doUpdateSet(patient_presence)).returningAll(),
      )
      .with(
        'employment_presence',
        (qb) =>
          qb.insertInto('employment_presence')
            .values(employment_presence).onConflict((oc) => oc.column('id').doUpdateSet(employment_presence)),
      )
      .selectFrom('inserting_patient_presence')
      .selectAll('inserting_patient_presence')
      .innerJoin('patients', 'inserting_patient_presence.id', 'patients.id')
      .select(['patients.completed_registration'])
      .executeTakeFirstOrThrow()

    // Optimistic update rather than check for this up front
    assert(
      completed_registration,
      "Supplied patient_id for patient that hasn't completed registration",
    )
    return inserted_patient_presence
  },
  /*
    Does not ensure that workflows are done.
    Any employees that are with the patient are no longer (employment_presence)
    and the patient is no longer at the organization (patient_presence)
  */
  async close(
    trx: TrxOrDb,
    { patient_encounter_id }: {
      patient_encounter_id: string
    },
  ) {
    const encounter = await patient_encounters.getById(
      trx,
      patient_encounter_id,
    )

    assert(encounter.status.open, 'Encounter already closed')

    const present_with_patient = encounter.status.patient_presence
      .present_with_patient_encounter_employee_ids.map(
        (patient_encounter_employee_id) =>
          exists(encounter.all_employees_seen.find(matching({
            patient_encounter_employee_id,
          }))),
      )

    await trx.with(
      'updating_employment_presence',
      (qb) =>
        present_with_patient.length
          ? qb.updateTable('employment_presence')
            .set({
              at_work: true,
              with_patient_id: null,
            })
            .where(
              'employment_presence.id',
              'in',
              present_with_patient.map((e) => e.employee_id),
            )
          : blankSelection(qb),
    ).with(
      'deleting_patient_presence',
      (qb) =>
        qb.deleteFrom('patient_presence')
          .where('id', '=', encounter.patient.id),
    ).with(
      'updating_patient_encounter',
      (qb) =>
        qb.updateTable('patient_encounters')
          .set({
            closed_at: now,
          })
          .where('id', '=', patient_encounter_id),
    )
      .selectNoFrom([success_true])
      .executeTakeFirstOrThrow()
  },
  isOpen(
    encounter: RenderedPatientEncounter,
  ): encounter is RenderedPatientOpenEncounter {
    return encounter.status.open
  },
  assertIsOpen(
    encounter: RenderedPatientEncounter,
  ): asserts encounter is RenderedPatientOpenEncounter {
    assert(encounter.status.open)
  },
  async getOpen(
    trx: TrxOrDb,
    search_terms: Omit<EncounterSearch, 'is_open' | 'is_closed'>,
  ): Promise<RenderedPatientOpenEncounter[]> {
    const results = await patient_encounters.findAll(trx, {
      ...search_terms,
      is_open: true,
    })
    assertAll(results, patient_encounters.assertIsOpen)
    return results
  },
  async getFirstOpen(
    trx: TrxOrDb,
    search_terms: Omit<EncounterSearch, 'is_open' | 'is_closed'>,
  ): Promise<RenderedPatientOpenEncounter | undefined> {
    const results = await patient_encounters.getOpen(trx, search_terms)
    if (results.length > 1) {
      throw new Error('Multiple open encounters found for the same patient')
    }
    return first(results)
  },
  updateOne(
    trx: TrxOrDb,
    patient_encounter_id: string,
    updates: {
      reason: EncounterReason
      notes?: Maybe<string>
    },
  ) {
    return trx.updateTable('patient_encounters')
      .where('id', '=', patient_encounter_id)
      .set(updates)
      .execute()
  },
})
