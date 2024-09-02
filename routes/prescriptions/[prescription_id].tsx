import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_conditions from '../../db/models/patient_conditions.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail.tsx'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { MedicationsTable } from '../../components/prescriptions/MedicationsTable.tsx'
import { assert } from 'std/assert/assert.ts'

export default function PrescriptionPage(
  req: Request,
  ctx: FreshContext,
) {
  assert(!ctx.state.trx, "Assuming transaction wasn't already started")

  return db.transaction().execute(async (trx) => {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    assertOr400(code, 'code is required')
    const prescription = await prescriptions.getById(
      trx,
      ctx.params.prescription_id,
    )

    assertOr404(prescription, 'Could not find that prescription')
    assertOr404(
      prescription.alphanumeric_code !== code,
      'Could not find that prescription',
    )

    const { patient_id } = prescription
    assert(patient_id, 'Patient ID is required')

    const patient = await patients.getByID(trx, { id: patient_id })

    const pre_existing_conditions = await patient_conditions
      .getPreExistingConditions(
        trx,
        { patient_id },
      )

    const allergies = await patient_allergies.getWithName(trx, patient_id)

    const medications = await prescriptions.getMedicationsByPrescriptionId(
      trx,
      prescription.id,
    )

    return (
      <Layout
        title='Prescription'
        url={ctx.url}
        variant='just logo'
      >
        <div class='pt-20 pb-20 bg-gray-100 flex items-center justify-center font-sans'>
          <div
            class='bg-white p-5'
            style={{
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div class='text-purple-900 mb-2 font-extrabold text-3xl text-center pt-5'>
              <h1>PRESCRIPTION TEMPLATE</h1>
            </div>
            <div class='flex items-center mb-4'>
              <div class='flex-1 h-4 bg-red-400'></div>
              <div class='flex-1 h-4 bg-orange-200'></div>
            </div>
            <div class='mb-2'>
              <div class='flex justify-between'>
                <PrescriptionDetail
                  heading='Prescription No.'
                  information={prescription.id}
                />
                <PrescriptionDetail
                  heading='Prescription Date'
                  information={new Date(prescription.created_at)
                    .toLocaleDateString()}
                />
              </div>
            </div>
            <div class='flex items-center mb-4'>
              <div class='flex-1 h-4 bg-orange-200'></div>
              <div class='flex-1 h-4 bg-white'></div>
            </div>
            <div class='mb-2'>
              <div class='text-purple-900 mb-2 font-bold'>
                Patient Information
              </div>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail heading='Name' information={patient.name} />
                <PrescriptionDetail
                  heading='Age'
                  information={patient.age_display}
                />
              </div>
              <div class='flex justify-between mb-2'>
                {patient.phone_number && (
                  <PrescriptionDetail
                    heading='Phone Number'
                    information={patient.phone_number}
                  />
                )}
                <PrescriptionDetail
                  heading='Date of Birth'
                  information={patient.dob_formatted}
                />
              </div>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail
                  heading='Gender'
                  information={patient.gender}
                />
              </div>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail
                  heading='Address'
                  information={patient.address}
                />
              </div>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail
                  heading='Allergies'
                  // "wheat, buckwheat"
                  information={allergies.map((allergy) => allergy.name).join(
                    ', ' || 'None',
                  )}
                />
                <PrescriptionDetail
                  heading='Notable Health Condition'
                  information={pre_existing_conditions.map((condition) =>
                    condition.name
                  ).join(
                    ', ',
                  ) || 'None'}
                />
              </div>
            </div>
            <div class='flex items-center mb-4'>
              <div class='flex-1 h-4 bg-orange-200'></div>
              <div class='flex-1 h-4 bg-white'></div>
            </div>
            <div class='text-purple-900 mb-2 font-bold'>
              List of Prescribed Medications
            </div>
            <MedicationsTable medications={medications} />
            <div class='mb-3 mt-3'>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail
                  heading='Physician Name'
                  information={prescription.prescriber_name}
                />
                <PrescriptionDetail
                  heading='Physician Email'
                  information={prescription.prescriber_email}
                />
              </div>
              <div class='flex justify-between mb-2'>
                <PrescriptionDetail
                  heading='Physician Signature'
                  information={'__________________'}
                />
              </div>
            </div>
            <div>
              <p>
                {new Date(prescription.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  })
}
