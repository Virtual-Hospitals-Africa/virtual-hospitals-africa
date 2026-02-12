import { HealthWorkerOrganization, RenderedOrganization, TrxOrDb } from '../../types.ts'
import { Workflow } from '../../db.d.ts'
import { patient_new_encounters } from './patient_new_encounters.ts'

export const patient_new = {
  create(
    trx: TrxOrDb,
    values: {
      organization: RenderedOrganization
      organization_employment: HealthWorkerOrganization
      current_workflow: Workflow
      next_workflows: Workflow[]
    },
  ) {
    return patient_new_encounters.create(trx, {
      patient: { create: true as const },
      ...values,
    })
  },
  completed(
    trx: TrxOrDb,
    {
      patient_id,
    }: {
      patient_id: string
    },
  ) {
    return trx.updateTable('patients')
      .where('id', '=', patient_id)
      .set({ completed_registration: true })
      .execute()
  },
}
