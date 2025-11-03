import { FreshContext } from 'fresh'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as prescription_medications from '../../db/models/prescription_medications.ts'
import * as patients from '../../db/models/patients.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail.tsx'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { MedicationsTable } from '../../components/prescriptions/MedicationsTable.tsx'
import { assert } from 'std/assert/assert.ts'
import { promiseProps } from '../../util/promiseProps.ts'

function Divider() {
  return (
    <div className='flex items-center mb-4'>
      <div className='flex-1 h-4 bg-red-400'></div>
      <div className='flex-1 h-4 bg-orange-200'></div>
    </div>
  )
}

// deno-lint-ignore require-await
export default async function PrescriptionPage(
  ctx: FreshContext,
) {
  assert(!ctx.state.trx, "Assuming transaction wasn't already started")

  return db.transaction().execute(async (trx) => {
    const { searchParams } = ctx.url
    const code = searchParams.get('code')
    assertOr400(code, 'code is required')
    const prescription = await prescriptions.getById(
      trx,
      ctx.params.prescription_id,
    )

    assertOr404(prescription, 'Could not find that prescription')
    assertOr404(
      prescription.alphanumeric_code === code,
      'Could not find that prescription',
    )

    const { patient_id } = prescription
    assert(patient_id, 'Patient ID is required')

    const {
      patient,
      allergies,
      unfilled_medications,
    } = await promiseProps({
      patient: patients.getById(trx, patient_id),
      allergies: patient_allergies.getWithName(trx, patient_id),
      unfilled_medications: prescription_medications.getByPrescriptionId(
        trx,
        prescription.id,
        { unfilled: true },
      ),
    })

    return (
      <Layout
        title='Prescription'
        url={ctx.url}
        variant='just logo'
      >
        <div className='flex items-center justify-center pt-20 pb-20 font-sans bg-gray-100'>
          <div
            className='p-5 bg-white'
            style={{
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className='pt-5 mb-2 text-3xl font-extrabold text-center text-purple-900'>
              <h1>PRESCRIPTION</h1>
            </div>
            <Divider />
            <div className='mb-2'>
              <div className='flex justify-between'>
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
            <Divider />
            <div className='mb-2'>
              <div className='mb-2 font-bold text-purple-900'>
                Patient Information
              </div>
              {/* wkhtml2pdf can't handle css grid */}
              <div /*className='grid grid-cols-2'*/>
                <PrescriptionDetail heading='Name' information={patient.name} />
                <PrescriptionDetail
                  heading='Age'
                  information={patient.age_display}
                />
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
                <PrescriptionDetail
                  heading='Sex'
                  information={patient.sex}
                />
                <PrescriptionDetail
                  heading='Address'
                  information={patient.address}
                />
                <PrescriptionDetail
                  heading='Allergies'
                  information={allergies.map((allergy) =>
                    allergy.snomed_english_term
                  ).join(
                    ', ',
                  ) || 'None'}
                />
              </div>
            </div>
            <Divider />
            <div className='mb-2 font-bold text-purple-900'>
              List of Prescribed Medications
            </div>
            <div className='pb-4'>
              <MedicationsTable medications={unfilled_medications} />
            </div>
            <Divider />
            <div className='mb-2 font-bold text-purple-900'>
              Physician Information
            </div>
            <div className='mt-3 mb-3'>
              {/* wkhtml2pdf can't handle css grid */}
              <div /*className='grid grid-cols-2'*/>
                <PrescriptionDetail
                  heading='Name'
                  information={prescription.prescriber_name}
                />
                <PrescriptionDetail
                  heading='Email'
                  information={prescription.prescriber_email}
                />
                <PrescriptionDetail
                  heading='Phone Number'
                  information={prescription.prescriber_mobile_number}
                />
                <PrescriptionDetail
                  heading='Signature'
                  information='__________________'
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  })
}
