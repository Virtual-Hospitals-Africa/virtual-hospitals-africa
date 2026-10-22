import { diagnoses } from '../../../../../../db/models/diagnoses.ts'
import { employees } from '../../../../../../db/models/employees.ts'
import { patient_encounters } from '../../../../../../db/models/patient_encounters.ts'
import { patient_history } from '../../../../../../db/models/patient_history.ts'
import { patients } from '../../../../../../db/models/patients.ts'
import { referrals } from '../../../../../../db/models/referrals.ts'
import { this_visit_findings } from '../../../../../../db/models/this_visit_findings.ts'
import { isPatientCaseTab, PatientCase } from '../../../../../../components/patients/profile/PatientCase.tsx'
import { firstIncompleteStep, lastStep, WORKFLOW_SNOMED_CONCEPTS, workflowStepSnomedConcept } from '../../../../../../shared/workflow.ts'
import type {
  CurrentWorkflowState,
  OrganizationContext,
  RenderedEmployee,
  RenderedPatientOpenEncounter,
  TrxOrDbOrQueryCreator,
} from '../../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'

function isLaterReferral(
  candidate: { id: string; created_at: Date | string },
  selected: { id: string; created_at: Date | string },
): boolean {
  const candidate_created_at = new Date(candidate.created_at).getTime()
  const selected_created_at = new Date(selected.created_at).getTime()
  if (candidate_created_at === selected_created_at) return candidate.id > selected.id
  return candidate_created_at > selected_created_at
}

function latestReferral<Referral extends { id: string; created_at: Date | string }>(
  matches: Referral[],
): Referral | null {
  let selected: Referral | null = null
  for (const referral of matches) {
    if (!selected || isLaterReferral(referral, selected)) selected = referral
  }
  return selected
}

async function referringEmployee(
  trx: TrxOrDbOrQueryCreator,
  {
    patient_encounter_id,
    notified_health_worker_id,
  }: {
    patient_encounter_id: string
    notified_health_worker_id: string
  },
): Promise<RenderedEmployee | null> {
  const matches = await referrals.findAll(trx, {
    patient_encounter_id,
    notified_health_worker_id,
  })
  const referral = latestReferral(matches)
  if (!referral) return null
  return employees.getById(trx, referral.employment_id)
}

function currentWorkflowState(
  encounter: RenderedPatientOpenEncounter,
): CurrentWorkflowState | null {
  const workflow = encounter.status.patient_presence.current_workflow
  if (!workflow) return null
  const workflow_status = encounter.workflows[workflow]
  if (!workflow_status) return null
  const step = firstIncompleteStep(workflow, workflow_status.steps_completed) ?? lastStep(workflow)
  return {
    workflow,
    step,
    workflow_snomed_concept: WORKFLOW_SNOMED_CONCEPTS[workflow],
    workflow_step_snomed_concept: workflowStepSnomedConcept(workflow, step),
    workflow_status,
  }
}

export default async function PatientCasePage(ctx: OrganizationContext) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const { trx, health_worker, organization } = ctx.state
  const requested_tab = ctx.url.searchParams.get('tab')
  const active_tab = isPatientCaseTab(requested_tab) ? requested_tab : 'overview'

  const patient = await patients.getById(trx, patient_id, {
    include_incomplete_registration: true,
  })
  const encounter = await patient_encounters.getFirstOpen(trx, { patient_id })
  const current_workflow_state = encounter ? currentWorkflowState(encounter) : null

  const loaded = await promiseProps({
    history: patient_history.get(trx, {
      patient_id,
      health_worker_id: health_worker.id,
      encounter,
    }),
    this_visit_findings: encounter
      ? this_visit_findings.get(trx, {
        health_worker_id: health_worker.id,
        encounter,
        current_workflow_state,
      })
      : Promise.resolve([]),
    this_visit_diagnoses: encounter
      ? diagnoses.get(trx, {
        encounter,
        health_worker_id: health_worker.id,
      })
      : Promise.resolve([]),
    referring_employee: encounter
      ? referringEmployee(trx, {
        patient_encounter_id: encounter.patient_encounter_id,
        notified_health_worker_id: health_worker.id,
      })
      : Promise.resolve(null),
  })

  const case_href = `/app/organizations/${organization.id}/patients/${patient.id}/case`
  const back_href = patient.completed_registration
    ? `/app/organizations/${organization.id}/patients/${patient.id}/profile`
    : `/app/organizations/${organization.id}/waiting_room`

  return (
    <PatientCase
      patient={patient}
      priority_name={encounter?.priority?.name ?? null}
      back_href={back_href}
      case_href={case_href}
      active_tab={active_tab}
      organization_id={organization.id}
      current_workflow={current_workflow_state?.workflow ?? null}
      this_visit_findings={loaded.this_visit_findings}
      this_visit_diagnoses={loaded.this_visit_diagnoses}
      history={loaded.history}
      referring_employee={loaded.referring_employee}
    />
  )
}
