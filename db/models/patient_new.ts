import { HealthWorkerOrganization, RenderedOrganization, TrxOrDbOrQueryCreator } from '../../types.ts'
import { Workflow } from '../../db.d.ts'
import { patient_new_encounters } from './patient_new_encounters.ts'

export const patient_new = {
  create(
    trx: TrxOrDbOrQueryCreator,
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
}
