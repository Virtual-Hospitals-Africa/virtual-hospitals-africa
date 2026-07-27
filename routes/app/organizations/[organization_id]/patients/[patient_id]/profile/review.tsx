import { PatientProfilePage } from './_middleware.tsx'
import PatientReview from '../../../../../../../components/patients/profile/PatientReview.tsx'
import type { ReviewRow } from '../../../../../../../components/patients/profile/PatientReview.tsx'

export default PatientProfilePage(
  'Review',
  async function ReviewPage(ctx) {
    const { trx, patient } = ctx.state

    const rows = await trx
      .selectFrom('patient_records_aggregated')
      .where('patient_records_aggregated.patient_id', '=', patient.id)
      .select([
        'patient_records_aggregated.id',
        'patient_records_aggregated.created_at',
        'patient_records_aggregated.specific_snomed_concept_name',
        'patient_records_aggregated.root_snomed_concept_name',
        'patient_records_aggregated.root_snomed_concept_category',
        'patient_records_aggregated.existence',
      ])
      .orderBy('patient_records_aggregated.created_at', 'desc')
      .execute()

    const records: ReviewRow[] = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      specific_snomed_concept_name: r.specific_snomed_concept_name,
      root_snomed_concept_name: r.root_snomed_concept_name,
      root_snomed_concept_category: r.root_snomed_concept_category,
      existence: r.existence,
    }))

    return <PatientReview records={records} />
  },
)
