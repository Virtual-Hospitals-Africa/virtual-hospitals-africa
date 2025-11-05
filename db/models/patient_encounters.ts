import { sql } from 'kysely'
import {
  HealthWorkerEmployment,
  InsertShape,
  isPriority,
  Maybe,
  PostgresInterval,
  RenderedOrganization,
  RenderedPatientEncounter,
  RenderedPatientEncounterStatus,
  RenderedPatientOpenEncounter,
  RenderedPatientPresence,
  SelectShape,
  TrxOrDb,
  WorkflowStatus,
} from '../../types.ts'
import * as patients from './patients.ts'
import * as organizations from './organizations.ts'
import {
  blankSelection,
  jsonArrayFrom,
  jsonArrayFromColumn,
  jsonBuildObject,
  jsonObjectFrom,
  literalLocation,
  now,
} from '../helpers.ts'
import {
  EmploymentPresence,
  EncounterReason,
  PatientPresence,
  Workflow,
} from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID, { isUUID } from '../../util/uuid.ts'
import { base, QueryResult } from './_base.ts'
import {
  assertDepartment,
  WORKFLOW_DEPARTMENTS,
} from '../../shared/departments.ts'
import {
  arrayIsEmpty,
  assertArrayEmpty,
  assertArrayNonEmpty,
} from '../../util/arraySize.ts'
import { isWorkflow, WORKFLOW_STEPS } from '../../shared/workflow.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { assertAll } from '../../util/assertAll.ts'
import { HealthWorkerIdSelection } from './health_worker_id.ts'

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

export function seenPatientEncounterEmployeeId(
  encounter: RenderedPatientEncounter,
  organization_employment: HealthWorkerEmployment,
) {
  const employee = encounter.all_employees_seen.find((employee) =>
    employee.employment_id === organization_employment.non_admin_id
  )
  assert(
    employee,
    'If the encounter exists and the health worker is manipulating it, the health worker must have seen the patient at least once',
  )
  return employee.patient_encounter_employee_id
}

export async function insertSeekingTreatmentForRegisteredPatient(
  trx: TrxOrDb,
  organization: RenderedOrganization,
  organization_employment: HealthWorkerEmployment,
  {
    patient_id,
    encounter,
  }: {
    patient_id: string
    encounter: EncounterExistingOrToCreate
  },
): Promise<SelectShape<PatientPresence>> {
  const { patient_encounter_id } = encounter
  assert(isUUID(patient_encounter_id), 'Caller must supply uuid upon creation')

  const { location } = organization
  assert(
    location,
    'Can only add encounters for organizations with a location',
  )

  const patient_encounter_employee_id = encounter.create
    ? generateUUID()
    : seenPatientEncounterEmployeeId(
      encounter.existing,
      organization_employment,
    )

  assert(
    patient_encounter_employee_id,
    'Caller must supply patient_encounter_employee_id upon creation',
  )

  const { reason } = encounter.create ? encounter.to_create : encounter.existing
  assertEquals(
    reason,
    'seeking treatment',
    'Only seeking treatment supported for now!',
  )

  const { non_admin_id } = organization_employment
  assert(non_admin_id)
  const workflows: Workflow[] = ['triage', 'consultation']
  const patient_workflows = workflows.map((workflow) => ({
    id: generateUUID(),
    patient_encounter_id,
    workflow,
  }))

  const patient_presence: InsertShape<PatientPresence> = {
    id: patient_id,
    patient_encounter_id,
    organization_id: organization.id,
    current_workflow: workflows[0],
    next_workflow: workflows[1],
    department_name: WORKFLOW_DEPARTMENTS[workflows[0]],
  }
  const employed_in_workflow_department = organization_employment.departments
    .some((
      department,
    ) => department.name === patient_presence.department_name)
  if (!employed_in_workflow_department) {
    patient_presence.next_workflow = patient_presence.current_workflow
    patient_presence.current_workflow = null
    patient_presence.department_name = 'waiting room'
  }

  const employment_presence: InsertShape<EmploymentPresence> = {
    id: non_admin_id,
    at_work: true,
    with_patient_id: employed_in_workflow_department ? patient_id : null,
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
              employment_id: non_admin_id,
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
          .values(patient_presence).onConflict((oc) =>
            oc.column('id').doUpdateSet(patient_presence)
          ).returningAll(),
    )
    .with(
      'employment_presence',
      (qb) =>
        qb.insertInto('employment_presence')
          .values(employment_presence).onConflict((oc) =>
            oc.column('id').doUpdateSet(employment_presence)
          ),
    )
    .selectFrom('inserting_patient_presence')
    .selectAll('inserting_patient_presence')
    .innerJoin('patients', 'inserting_patient_presence.id', 'patients.id')
    .select(['patients.completed_registration'])
    .executeTakeFirstOrThrow()

  assert(
    completed_registration,
    "Supplied patient_id for patient that hasn't completed registration",
  )
  return inserted_patient_presence
}

export function baseEncounterProviderQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('patient_encounter_employees')
    .innerJoin(
      'employment',
      'employment.id',
      'patient_encounter_employees.employment_id',
    )
    .innerJoin(
      'organizations',
      'organizations.id',
      'employment.organization_id',
    )
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .select([
      'patient_encounter_employees.id as patient_encounter_employee_id',
      'employment.id as employment_id',
      'employment.organization_id',
      'organizations.name as organization_name',
      'employment.profession',
      'employment.health_worker_id',
      'health_workers.name as health_worker_name',
      'health_workers.avatar_url',
      'employment.specialty',
      'patient_encounter_employees.seen_at',
    ])
}

export function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('patient_encounters')
    .innerJoin('patients', 'patients.id', 'patient_encounters.patient_id')
    .select((eb_encounters) => [
      'patient_encounters.id as patient_encounter_id',
      'patient_encounters.created_at as arrived_timestamp',
      'patient_encounters.closed_at',
      'patient_encounters.reason',
      'patient_encounters.notes',
      jsonBuildObject({
        id: eb_encounters.ref('patients.id'),
        name: eb_encounters.ref('patients.name'),
        avatar_url: patients.avatar_url_sql,
        description: sql<
          string | null
        >`patients.gender || ', ' || to_char(date_of_birth, 'DD/MM/YYYY')`,
      }).as('patient'),
      jsonObjectFrom(
        organizations.baseQuery(trx)
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
              eb_appointments.selectFrom('appointment_providers')
                .innerJoin(
                  'employment',
                  'employment.id',
                  'appointment_providers.provider_id',
                )
                .innerJoin(
                  'health_workers',
                  'health_workers.id',
                  'employment.health_worker_id',
                )
                .whereRef(
                  'appointment_providers.appointment_id',
                  '=',
                  'appointments.id',
                )
                .select([
                  'health_workers.id as health_worker_id',
                  'employment.id as employment_id',
                  'health_workers.name',
                  'employment.organization_id',
                  'health_workers.avatar_url',
                  'employment.specialty',
                  'employment.profession',
                ]),
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
            'snomed_inferred_canonical_name_and_category',
            'patient_records.snomed_concept_id',
            'snomed_inferred_canonical_name_and_category.id',
          )
          .whereRef(
            'patient_records.patient_encounter_id',
            '=',
            'patient_encounters.id',
          )
          .orderBy('patient_records.created_at', 'desc')
          .select([
            'patient_records.snomed_concept_id',
            'snomed_inferred_canonical_name_and_category.name',
            'patient_triage_level.target_treatment_time',
          ])
          .limit(1),
      ).as('priority'),
      jsonObjectFrom(
        eb_encounters.selectFrom('patient_presence')
          .whereRef('patient_encounters.patient_id', '=', 'patient_presence.id')
          .select((eb_patient_presence) => [
            'patient_presence.organization_id',
            'patient_presence.department_name',
            'patient_presence.current_workflow',
            'patient_presence.next_workflow',
            jsonArrayFrom(
              baseEncounterProviderQuery(trx)
                .where(
                  'patient_encounter_employees.employment_id',
                  'in',
                  eb_patient_presence.selectFrom('employment_presence')
                    .whereRef(
                      'employment_presence.with_patient_id',
                      '=',
                      'patient_presence.id',
                    ).select('employment_presence.id'),
                  // (join) =>
                  //   join.on(
                  //     'employment_presence.with_patient_id',
                  //     '=',
                  //     eb_patient_presence.ref('patient_presence.id'),
                  //   ),
                ),
            ).as('employees'),
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
            jsonArrayFrom(
              baseEncounterProviderQuery(trx)
                .where(
                  'patient_encounter_employees.id',
                  'in',
                  eb_patient_workflows.selectFrom(
                    'patient_workflows_started',
                  )
                    .whereRef(
                      'patient_workflows_started.patient_workflow_id',
                      '=',
                      'patient_workflows.id',
                    )
                    .select('patient_encounter_employee_id').distinct(),
                ),
            ).as('employees'),
          ]),
      ).as('workflows'),
      jsonArrayFrom(
        baseEncounterProviderQuery(trx)
          .where(
            'patient_encounter_employees.id',
            '=',
            eb_encounters.ref('patient_encounters.id'),
          ),
      ).as('all_employees_seen'),
    ])
}

type IntermediatePatientEncounterResult = QueryResult<typeof baseQuery>

function asPriority(
  priority: IntermediatePatientEncounterResult['priority'],
): RenderedPatientEncounter['priority'] {
  if (!priority) return priority
  const { name, ...rest } = priority
  assert(isPriority(name))
  return { name, ...rest }
}

function asWorkflowStatus(
  { patient_workflow_id, workflow, completed_at, steps_completed, employees }:
    IntermediatePatientEncounterResult['workflows'][0],
  status: RenderedPatientEncounterStatus,
): WorkflowStatus {
  assert(isWorkflow(workflow))
  const workflow_steps = WORKFLOW_STEPS[workflow]
  if (completed_at) {
    assertArrayNonEmpty(employees)
    assertEquals(workflow_steps, steps_completed)
    return {
      patient_workflow_id,
      workflow,
      status: 'completed',
      steps_completed,
      employees,
      completed_at,
    }
  }

  assertNotEquals(workflow_steps, steps_completed)

  if (!status.open) {
    if (arrayIsEmpty(employees)) {
      assertArrayEmpty(steps_completed)
      return {
        patient_workflow_id,
        workflow,
        status: 'not started',
        steps_completed,
        employees,
      }
    }
    assertArrayNonEmpty(employees)
    return {
      patient_workflow_id,
      workflow,
      status: 'incomplete',
      steps_completed,
      employees,
    }
  }

  if (status.patient_presence.current_workflow === workflow) {
    assertArrayNonEmpty(employees)
    return {
      patient_workflow_id,
      workflow,
      status: 'in progress',
      steps_completed,
      employees,
    }
  }

  if (arrayIsEmpty(employees)) {
    assertArrayEmpty(steps_completed)
    return {
      patient_workflow_id,
      workflow,
      status: 'not started',
      steps_completed,
      employees,
    }
  }

  assertArrayNonEmpty(employees)
  return {
    patient_workflow_id,
    workflow,
    status: 'incomplete',
    steps_completed,
    employees,
  }
}

function asWorkflows(
  workflows_array: IntermediatePatientEncounterResult['workflows'],
  status: RenderedPatientEncounterStatus,
): RenderedPatientEncounter['workflows'] {
  const workflows: RenderedPatientEncounter['workflows'] = {}
  for (const workflow_item of workflows_array) {
    workflows[workflow_item.workflow] = asWorkflowStatus(workflow_item, status)
  }
  return workflows
}

function asPatientPresence(
  { department_name, current_workflow, next_workflow, employees }: NonNullable<
    IntermediatePatientEncounterResult['patient_presence']
  >,
): RenderedPatientPresence {
  assertDepartment(department_name)

  if (department_name === 'waiting room') {
    assert(!current_workflow)
    assert(next_workflow)
    assertArrayEmpty(employees)
    return {
      department_name,
      current_workflow,
      next_workflow,
      employees,
    }
  }

  assert(current_workflow)
  return {
    department_name,
    current_workflow,
    next_workflow,
    employees,
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

type EncounterSearch = {
  is_open?: boolean
  is_closed?: boolean
  organization_id?: string
  patient_id?: string
  // ever_seen_health_worker_id?: string
  presence_health_worker_id?: string | HealthWorkerIdSelection
  ids?: string[]
}

const model = base({
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
      ...patient_encounter
    },
  ): RenderedPatientEncounter => {
    assert(organization)
    const status = asStatus(patient_presence, closed_at)
    return {
      organization,
      workflows: asWorkflows(workflows, status),
      priority: asPriority(priority),
      status,
      patient: {
        ...patient,
        name: patient.name || '[Unregistered patient]',
      },
      reason,
      ...patient_encounter,
    }
  },
  handleSearch(
    qb,
    opts: EncounterSearch,
  ) {
    if (opts.ids) {
      qb = qb.where('patient_encounters.id', 'in', opts.ids)
    }
    if (opts.is_open) {
      assert(!opts.is_closed)
      qb = qb.where('patient_encounters.closed_at', 'is', null)
    }
    if (opts.is_closed) {
      assert(!opts.is_open)
      qb = qb.where('patient_encounters.closed_at', 'is not', null)
    }
    if (opts.organization_id) {
      qb = qb.where(
        'patient_encounters.organization_id',
        '=',
        opts.organization_id,
      )
    }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_encounters.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts.presence_health_worker_id) {
      assert(opts.is_open)
      qb = qb.innerJoin(
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
        opts.presence_health_worker_id,
      )
    }
    return qb
  },
})

export const getById = model.getById
export const search = model.search
export const findAll = model.findAll
export const findOne = model.findOne
export const findOneOptional = model.findOneOptional
export const searchQuery = model.searchQuery
export const formatResult = model.formatResult

export function close(
  trx: TrxOrDb,
  { patient_encounter_id }: {
    patient_encounter_id: string
  },
) {
  return trx.updateTable('patient_encounters')
    .set({
      closed_at: now,
    })
    .where('id', '=', patient_encounter_id)
    .executeTakeFirstOrThrow()
}

export function isOpen(
  encounter: RenderedPatientEncounter,
): encounter is RenderedPatientOpenEncounter {
  return encounter.status.open
}

export function assertIsOpen(
  encounter: RenderedPatientEncounter,
): asserts encounter is RenderedPatientOpenEncounter {
  assert(encounter.status.open)
}

export async function getOpen(
  trx: TrxOrDb,
  search_terms: Omit<EncounterSearch, 'is_open' | 'is_closed'>,
): Promise<RenderedPatientOpenEncounter[]> {
  const { results } = await search(trx, {
    ...search_terms,
    is_open: true,
  }, { rows_per_page: Infinity })
  assertAll(results, assertIsOpen)
  return results
}

export function updateOne(
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
}
