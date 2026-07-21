import { PatientProfilePage } from './_middleware.tsx'
import { patient_encounters } from '../../../../../../../db/models/patient_encounters.ts'
import PatientVisits from '../../../../../../../components/patients/profile/PatientVisits.tsx'

export default PatientProfilePage(
  'Visits',
  async function VisitsPage(ctx) {
    const status = ctx.url.searchParams.get('status') as 'open' | 'closed' | null

    const encounters = await patient_encounters.findAll(ctx.state.trx, {
      patient_id: ctx.state.patient.id,
      is_open: status === 'open' ? true : undefined,
      is_closed: status === 'closed' ? true : undefined,
    })

    const org_ids = [...new Set(encounters.map((e) => e.organization_id))]
    const org_rows = org_ids.length
      ? await ctx.state.trx
        .selectFrom('organizations')
        .where('organizations.id', 'in', org_ids)
        .select(['organizations.id', 'organizations.name'])
        .execute()
      : []
    const org_names: Record<string, string> = {}
    for (const row of org_rows) org_names[row.id] = row.name

    return (
      <PatientVisits
        encounters={encounters}
        org_names={org_names}
        status={status}
        action={ctx.url.pathname}
        organization_id={ctx.params.organization_id}
        patient_id={ctx.state.patient.id}
      />
    )
  },
)
