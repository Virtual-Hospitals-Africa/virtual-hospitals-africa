import { PatientProfilePage } from './_middleware.tsx'
import PatientOrders from '../../../../../../../components/patients/profile/PatientOrders.tsx'
import type { OrderRow } from '../../../../../../../components/patients/profile/PatientOrders.tsx'

export default PatientProfilePage(
  'Orders',
  async function OrdersPage(ctx) {
    const { trx, patient } = ctx.state

    const rows = await trx
      .selectFrom('patient_records_aggregated')
      .innerJoin('patient_procedures', 'patient_procedures.id', 'patient_records_aggregated.id')
      .innerJoin('patient_prescription_signatures', 'patient_prescription_signatures.id', 'patient_procedures.id')
      .leftJoin(
        'patient_prescription_redemption_codes',
        'patient_prescription_redemption_codes.patient_prescription_signature_id',
        'patient_prescription_signatures.id',
      )
      .where('patient_records_aggregated.patient_id', '=', patient.id)
      .select([
        'patient_records_aggregated.id',
        'patient_records_aggregated.created_at',
        'patient_records_aggregated.specific_snomed_concept_name',
        'patient_records_aggregated.root_snomed_concept_name',
        'patient_prescription_redemption_codes.alphanumeric_code',
      ])
      .orderBy('patient_records_aggregated.created_at', 'desc')
      .execute()

    const orders: OrderRow[] = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      specific_snomed_concept_name: r.specific_snomed_concept_name,
      root_snomed_concept_name: r.root_snomed_concept_name,
      alphanumeric_code: r.alphanumeric_code ?? null,
    }))

    return <PatientOrders orders={orders} />
  },
)
