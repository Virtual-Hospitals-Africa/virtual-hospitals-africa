import { Context } from 'fresh'
import JustLogoLayout from '../../components/library/JustLogoLayout.tsx'
import db from '../../db/db.ts'
import { patient_prescriptions } from '../../db/models/patient_prescriptions.ts'
import { patients } from '../../db/models/patients.ts'
import { patient_contacts } from '../../db/models/patient_contacts.ts'
import { assertOr400, assertOr404 } from '../../util/assertOr.ts'
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail.tsx'
// import { MedicationsTable } from '../../components/prescriptions/MedicationsTable.tsx'
import { assert } from 'std/assert/assert.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { patient_record_providers } from '../../db/models/patient_record_providers.ts'
import { healthWorkerIdOfEmploymentId } from '../../db/models/health_worker_id.ts'

function Divider() {
  return (
    <div className='flex items-center mb-4'>
      <div className='flex-1 h-4 bg-red-400'></div>
      <div className='flex-1 h-4 bg-orange-200'></div>
    </div>
  )
}

export default async function PrescriptionPage(
  ctx: Context<Record<string, unknown>>,
) {
  assert(!ctx.state.db, "Assuming transaction wasn't already started")

  const { searchParams } = ctx.url
  const code = searchParams.get('code')
  assertOr400(code, 'code is required')
  const prescription_raw = await patient_prescriptions.getById(
    db,
    ctx.params.prescription_id,
  )

  const [prescription] = await patient_record_providers.hydrateIntermediateRecords(
    db,
    {
      records: [prescription_raw],
      health_worker_id: healthWorkerIdOfEmploymentId(db, prescription_raw.employment_id),
    },
  )

  assertOr404(
    prescription.alphanumeric_code,
    'No redemption code available for that prescription',
  )

  assertOr404(
    prescription.alphanumeric_code === code,
    'Could not find that prescription',
  )

  const { patient_id } = prescription
  assert(patient_id, 'Patient ID is required')

  const {
    patient,
    contacts,
    // allergies,
    // unfilled_medications,
  } = await promiseProps({
    patient: patients.getById(db, patient_id),
    contacts: patient_contacts.get(db, { patient_id }),
    // allergies: patient_allergies.getWithName(db, patient_id),
    // unfilled_medications: prescriptions.getByPrescriptionId(
    //   db,
    //   prescription.id,
    //   { unfilled: true },
    // ),
  })

  return (
    <JustLogoLayout url={ctx.url} title='Prescription'>
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
              <PrescriptionDetail
                heading='Phone Number'
                information={contacts?.phone_number}
              />
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
                information={contacts?.formatted_address}
              />
              {
                /* <PrescriptionDetail
                heading='Allergies'
                information={allergies.map((allergy) => allergy.name).join(
                  ', ',
                ) || 'None'}
              /> */
              }
            </div>
          </div>
          <Divider />
          <div className='mb-2 font-bold text-purple-900'>
            List of Prescribed Medications
          </div>
          {
            /* <div className='pb-4'>
            <MedicationsTable medications={unfilled_medications} />
          </div> */
          }
          <Divider />
          <div className='mb-2 font-bold text-purple-900'>
            Physician Information
          </div>
          <div className='mt-3 mb-3'>
            {/* wkhtml2pdf can't handle css grid */}
            <div /*className='grid grid-cols-2'*/>
              {
                /* <PrescriptionDetail
                heading='Name'
                information={prescription}
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
              /> */
              }
            </div>
          </div>
        </div>
      </div>
    </JustLogoLayout>
  )
}
