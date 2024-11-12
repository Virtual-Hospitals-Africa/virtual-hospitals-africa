import { FreshContext } from '$fresh/server.ts'
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
      patient: patients.getByID(trx, { id: patient_id }),
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
        <div className='pt-20 pb-20 bg-gray-100 flex items-center justify-center font-sans'>
          <div
            className='bg-white p-5'
            style={{
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className='text-purple-900 mb-2 font-extrabold text-3xl text-center pt-5'>
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
              <div className='text-purple-900 mb-2 font-bold'>
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
                  heading='Gender'
                  information={patient.gender}
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
            <div className='text-purple-900 mb-2 font-bold'>
              List of Prescribed Medications
            </div>
            <div className='pb-4'>
              <MedicationsTable medications={unfilled_medications} />
            </div>
            <Divider />
            <div className='text-purple-900 mb-2 font-bold'>
              Physician Information
            </div>
            <div className='mb-3 mt-3'>
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
                  information={'__________________'}
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  })
}
