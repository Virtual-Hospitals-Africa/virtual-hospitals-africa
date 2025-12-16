import {
  assertAllPriorStepsCompleted,
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as vitals from '../../../../../../../../db/models/vitals.ts'
import * as patient_measurements from '../../../../../../../../db/models/patient_measurements.ts'
import * as patient_categorical_findings from '../../../../../../../../db/models/patient_categorical_findings.ts'
import { getRequiredUUIDParam } from '../../../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import {
  positive_number,
  snomed_concept_id,
} from '../../../../../../../../util/validators.ts'
import filterOfType from '../../../../../../../../util/filterOfType.ts'
import { VitalsMeasurementsForm } from '../../../../../../../../components/vitals/MeasurementsForm.tsx'
import { getActiveConditionsSnomedCodesFromContext } from '../../../../../../../../shared/vitals.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

const TriageMeasureVitalsSchema = z.object({
  findings: z.record(
    z.string().uuid(),
    z.object({
      snomed_concept_id,
      value: positive_number,
      units: z.string().min(1),
    }).strict(),
  ).transform((findings) =>
    Object.entries(findings).map((
      [finding_id, finding],
    ) => ({
      finding_id,
      ...finding,
      evaluation: null,
    }))
  ),
  assessments: z.record(
    z.string().uuid(), // finding_id (generated server-side)
    z.object({
      finding_id: z.string().uuid(),
      option_snomed_concept_id: snomed_concept_id,
    }).strict(),
  ).transform((assessments) =>
    Object.entries(assessments).map((
      [finding_id, assessment],
    ) => ({
      finding_id,
      option_snomed_concept_id: assessment.option_snomed_concept_id,
    }))
  ),
}).strict()

// TODO: this is way too duplicated around the codebase, ask will if we have an abstraction for it
function hasValue(
  finding: { value?: number },
): finding is { value: number } {
  return typeof finding.value === 'number' && finding.value >= 0
}

export const handler = postHandler(
  TriageMeasureVitalsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const input_measurements = filterOfType(form_values.findings, hasValue)
    const input_assessments = form_values.assessments

    const { response } = await promiseProps({
      inserting_vitals: vitals.insertMeasurementsAndAssessments(
        ctx.state.trx,
        {
          patient_id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          patient_encounter_employee_id:
            ctx.state.encounter_employee_presence.patient_encounter_employee_id,
          input_measurements,
          input_assessments,
        },
      ),
      response: completeAndProceedToNextStep(ctx),
    })

    return response
  },
)

/**  the context is:
 * {
  state: {
    health_worker: {
      id: "61ea8b53-474d-4fdd-99c0-f252d2d33315",
      name: "Tshepo Zulu",
      email: "265cd3f7-107f-4f4e-864e-e6ce7c647650@example.com",
      avatar_url: "/images/avatars/random/male/3.png",
      employment: [
        {
          organization: [Object],
          gcal_appointments_calendar_id: null,
          gcal_availability_calendar_id: null,
          availability_set: null,
          departments: [Array],
          provider_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
          non_admin_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
          roles: [Object]
        }
      ],
      present_encounter: {
        organization: {
          id: "00000000-0000-0000-0000-000000000001",
          name: "VHA Test Clinic South Africa",
          category: "Clinic",
          is_test: true,
          country: "ZA",
          ownership: "Govt.",
          inactive_reason: null,
          formatted_address: "123 Main St, Polokwane, South Africa, 23456",
          description: "123 Main St, Polokwane, South Africa, 23456",
          location: [Object],
          departments: [Array]
        },
        workflows: {
          registration: [Object],
          triage: [Object],
          consultation: [Object]
        },
        priority: null,
        status: { open: true, patient_presence: [Object] },
        patient: {
          id: "3b45649d-c06d-4bca-86c9-51aa553b67c9",
          name: "someone someone",
          avatar_url: null,
          description: "male, 20/06/1996"
        },
        reason: "seeking treatment",
        patient_encounter_id: "97b044d3-b17f-4e62-a61a-5e3546cf34ca",
        arrived_timestamp: 2025-11-11T16:15:28.314Z,
        notes: null,
        appointment: null,
        wait_time: PostgresInterval {
          hours: 2,
          minutes: 45,
          seconds: 5,
          milliseconds: 553.476
        },
        all_employees_seen: [ [Object] ]
      },
      access_token: "48e0c76c-6641-4e67-a880-ebe5a198fe87",
      refresh_token: "c8d0f382-25f7-47f2-88cf-53c220bcda85",
      expires_at: 2026-01-10T16:15:23.225Z,
      default_organization_id: "00000000-0000-0000-0000-000000000001",
      reviews: { in_progress: [], requested: [] }
    },
    trx: Transaction {},
    organization: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "VHA Test Clinic South Africa",
      category: "Clinic",
      is_test: true,
      country: "ZA",
      ownership: "Govt.",
      inactive_reason: null,
      formatted_address: "123 Main St, Polokwane, South Africa, 23456",
      description: "123 Main St, Polokwane, South Africa, 23456",
      location: { longitude: 29.7739353, latitude: -19.4554096 },
      departments: [
        {
          id: "31f5ce5f-ef1f-40fc-9211-47ecba65e8f8",
          name: "administration",
          requires_triage: false,
          workflows: []
        },
        {
          id: "1a1a1c07-6fa7-47e6-a5ba-e3dde60e4d8e",
          name: "chronic diseases",
          requires_triage: true,
          workflows: []
        },
        {
          id: "a73f3063-5d3c-45f2-9b8c-1f22f789acc3",
          name: "immunizations",
          requires_triage: true,
          workflows: []
        },
        {
          id: "e53954e6-dfcd-429d-9a71-ba3839b2ecd3",
          name: "maternity",
          requires_triage: true,
          workflows: [Array]
        },
        {
          id: "a330ed68-d1e0-4839-acec-2afbebd0e22f",
          name: "pharmacy",
          requires_triage: false,
          workflows: [Array]
        },
        {
          id: "4162b6ca-8ad3-4a91-a6cd-a2673b50b77c",
          name: "primary care",
          requires_triage: true,
          workflows: [Array]
        },
        {
          id: "73f5b866-2dcc-423a-a9cf-937792729690",
          name: "reception",
          requires_triage: false,
          workflows: [Array]
        },
        {
          id: "b1d25fc6-cedf-45e6-bfa6-162ae63c6d31",
          name: "triage",
          requires_triage: false,
          workflows: [Array]
        },
        {
          id: "5e9b789f-ffd1-4226-b414-e9b87c2049fc",
          name: "waiting room",
          requires_triage: false,
          workflows: []
        }
      ]
    },
    organization_employment: {
      organization: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "VHA Test Clinic South Africa",
        address: "123 Main St, Polokwane, South Africa, 23456"
      },
      gcal_appointments_calendar_id: null,
      gcal_availability_calendar_id: null,
      availability_set: null,
      departments: [
        {
          id: "4162b6ca-8ad3-4a91-a6cd-a2673b50b77c",
          name: "primary care"
        },
        {
          id: "73f5b866-2dcc-423a-a9cf-937792729690",
          name: "reception"
        },
        { id: "b1d25fc6-cedf-45e6-bfa6-162ae63c6d31", name: "triage" }
      ],
      provider_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
      non_admin_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
      roles: {
        nurse: {
          registration_needed: true,
          registration_completed: false,
          registration_pending_approval: true,
          employment_id: "7eec14a0-b243-48df-9e9e-a536267899ee"
        },
        doctor: null,
        admin: null,
        receptionist: null
      }
    },
    isAdminAtOrganization: false,
    encounter: {
      organization: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "VHA Test Clinic South Africa",
        category: "Clinic",
        is_test: true,
        country: "ZA",
        ownership: "Govt.",
        inactive_reason: null,
        formatted_address: "123 Main St, Polokwane, South Africa, 23456",
        description: "123 Main St, Polokwane, South Africa, 23456",
        location: { longitude: 29.7739353, latitude: -19.4554096 },
        departments: [
          [Object], [Object],
          [Object], [Object],
          [Object], [Object],
          [Object], [Object],
          [Object]
        ]
      },
      workflows: {
        registration: {
          patient_workflow_id: "8e7556db-234d-4409-926d-950fb7bbea86",
          workflow: "registration",
          status: "completed",
          steps_completed: [Array],
          employees: [Array],
          completed_at: "2025-11-11T16:16:01.84085+00:00"
        },
        triage: {
          patient_workflow_id: "dc3a3064-6db6-4305-9b3e-fb91e0d85355",
          workflow: "triage",
          status: "in progress",
          steps_completed: [Array],
          employees: [Array]
        },
        consultation: {
          patient_workflow_id: "1d3bace2-2975-4827-a975-1781370911be",
          workflow: "consultation",
          status: "not started",
          steps_completed: [],
          employees: []
        }
      },
      priority: null,
      status: {
        open: true,
        patient_presence: {
          department_name: "triage",
          current_workflow: "triage",
          next_workflow: "consultation",
          employees: [Array]
        }
      },
      patient: {
        id: "3b45649d-c06d-4bca-86c9-51aa553b67c9",
        name: "someone someone",
        avatar_url: null,
        description: "male, 20/06/1996"
      },
      reason: "seeking treatment",
      patient_encounter_id: "97b044d3-b17f-4e62-a61a-5e3546cf34ca",
      arrived_timestamp: 2025-11-11T16:15:28.314Z,
      notes: null,
      appointment: null,
      wait_time: PostgresInterval {
        hours: 2,
        minutes: 45,
        seconds: 5,
        milliseconds: 553.476
      },
      all_employees_seen: [
        {
          patient_encounter_employee_id: "81d18223-e361-4f8f-8d06-32dbd64467ad",
          employment_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
          seen_at: "2025-11-11T16:15:28.314672+00:00"
        }
      ]
    },
    encounter_employee_presence: {
      patient_encounter_employee_id: "81d18223-e361-4f8f-8d06-32dbd64467ad",
      employment_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
      organization_id: "00000000-0000-0000-0000-000000000001",
      profession: "nurse",
      health_worker_id: "61ea8b53-474d-4fdd-99c0-f252d2d33315",
      health_worker_name: "Tshepo Zulu",
      avatar_url: "/images/avatars/random/male/3.png",
      specialty: "primary care",
      seen_at: "2025-11-11T16:15:28.314672+00:00"
    },
    patient: {
      id: "3b45649d-c06d-4bca-86c9-51aa553b67c9",
      name: "someone someone",
      phone_number: null,
      gender: "male",
      ethnicity: null,
      address: "amsterdam, Zimbabwe",
      date_of_birth: "1996-06-20",
      dob_formatted: "20 June 1996",
      age_display: "29 years",
      age_number: 29,
      age_unit: "year",
      age_days: 10736,
      preferred_language_code_iso_639_2_b: null,
      age_years: 29,
      description: "male, 20/06/1996",
      national_id_number: null,
      completed_registration: true,
      avatar_url: null,
      last_visited: null,
      location: null,
      actions: { view: "/app/patients/3b45649d-c06d-4bca-86c9-51aa553b67c9" },
      nearest_organization: {
        id: "b2050109-cd23-4b97-9bda-861781f8a128",
        name: "Tsomo Village Clinic"
      },
      primary_doctor: null
    },
    workflow: "triage",
    step: "measure_vitals",
    workflow_status: {
      patient_workflow_id: "dc3a3064-6db6-4305-9b3e-fb91e0d85355",
      workflow: "triage",
      status: "in progress",
      steps_completed: [
        "warning_signs",
        "measure_vitals",
        "additional_investigations_and_tasks"
      ],
      employees: [
        {
          patient_encounter_employee_id: "81d18223-e361-4f8f-8d06-32dbd64467ad",
          employment_id: "7eec14a0-b243-48df-9e9e-a536267899ee",
          organization_id: "00000000-0000-0000-0000-000000000001",
          profession: "nurse",
          health_worker_id: "61ea8b53-474d-4fdd-99c0-f252d2d33315",
          health_worker_name: "Tshepo Zulu",
          avatar_url: "/images/avatars/random/male/3.png",
          specialty: "primary care",
          seen_at: "2025-11-11T16:15:28.314672+00:00"
        }
      ]
    },
    this_visit_records: {
      chief_complaint: [],
      vitals: [],
      symptoms: [],
      history: [],
      general_assessments: [],
      examinations: [],
      diagnostic_tests: [],
      diagnoses: [],
      prescriptions: [],
      orders: []
    },
    patient_history: {
      pre_existing_conditions: [],
      allergies: [],
      family_history: [],
      major_surgeries: [],
      medications: [],
      lifestyle: []
    },
    previously_completed_step: true
  },
  isPartial: false,
  destination: "route",
  error: undefined,
  codeFrame: undefined,
  Component: [Function: NOOP_COMPONENT],
  next: [Function (anonymous)],
  render: [AsyncFunction (anonymous)],
  renderNotFound: [AsyncFunction: renderNotFound],
  route: "/app/organizations/:organization_id/patients/:patient_id/open_encounter/triage/measure_vitals",
  pattern: [Getter],
  data: undefined
}
*/

export async function TriageMeasureVitalsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx)

  // TODO: Ask Will if during triage we care about active conditions as far as measurements are concerned
  const active_condition_snomed_codes =
    getActiveConditionsSnomedCodesFromContext(
      ctx.state.patient_history,
    )

  const [vital_measurements_for_this_encounter, triage_assessments] =
    await Promise.all([
      vitals.measurementsNeededForTriageEncounter(
        ctx.state.trx,
        ctx.state.patient,
        active_condition_snomed_codes,
      ),
      patient_categorical_findings.getTriageAssessmentsWithOptions(
        ctx.state.trx,
      ),
    ])

  const most_recent_patient_vitals = await patient_measurements
    .getMostRecent(
      ctx.state.trx,
      {
        patient_id: ctx.state.patient.id,
        snomed_concept_ids: vital_measurements_for_this_encounter.map((o) =>
          o.snomed_concept_id
        ),
      },
    )

  return (
    <VitalsMeasurementsForm
      vital_measurements_for_this_encounter={vital_measurements_for_this_encounter}
      triage_assessments={triage_assessments}
      most_recent_patient_vitals={most_recent_patient_vitals}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageMeasureVitalsPage)
