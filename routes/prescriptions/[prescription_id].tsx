import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patients from '../../db/models/patients.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail.tsx'
import * as patient_allergies from '../../db/models/patient_allergies.ts'
import { MedicationsTable } from '../../components/prescriptions/MedicationsTable.tsx'

export default async function PrescriptionPage(
  req: Request,
  ctx: FreshContext,
) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  assertOr400(code, 'code is required')
  const prescription = await prescriptions.getById(
    db,
    ctx.params.prescription_id,
  )

  if (!prescription) {
    throw new StatusError('Could not find that prescription', 404)
  }
  if (prescription.alphanumeric_code !== code) {
    throw new StatusError('Could not find that prescription', 404)
  }

  const patientId = prescription.patient_id
  assertOr400(patientId, 'Patient ID is required')

  const patient = await patients.getByID(db, { id: patientId })
  const prescriber = prescription.prescriber_id

  // const medications = [
  //   {
  //     id: '14c1923a-f9ae-4bdb-8ec7-c0a209af9a63',
  //     patient_condition_id: '5a9b85e7-cf04-4f79-8d8c-1145f6aa7610',
  //     medication_id: 'a798a1cf-c37a-43d7-a6be-679629d34ff1',
  //     strength: 20,
  //     route: 'INFUSION',
  //     special_instructions: 'Left buttcheek, then right buttcheek',
  //     start_date: '2002-07-07',
  //     schedules: '(2,nocte,683,days)',
  //   },
  //   {
  //     id: '07345a28-87f7-4c5b-859e-62b871747eba',
  //     patient_condition_id: '5a9b85e7-cf04-4f79-8d8c-1145f6aa7610',
  //     medication_id: 'a3efea2a-9079-473a-8a7f-9ebdbd06471d',
  //     strength: 0.25,
  //     route: 'ORAL',
  //     special_instructions: 'Instruction 1',
  //     start_date: '0003-01-02',
  //     schedules: '(1,ac,1,indefinitely)',
  //   },
  // ]

  const allergies = await patient_allergies.getWithName(db, patientId)

  const medications = await prescriptions.getMedicationsByPrescriptionId(
    db,
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
                  ', ',
                )}
              />
              <PrescriptionDetail
                heading='Notable Health Condition'
                information={'patient.health_conditions'}
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
          <div class='mb-3'>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Physician Name'
                information={prescriber}
              />
              <PrescriptionDetail
                heading='Physician Phone Number'
                information={'prescriber.phone_number'}
              />
            </div>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Physician Signature'
                information={'__________________'}
              />
              <PrescriptionDetail
                heading='Physician Email'
                information={'prescriber.email'}
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
}
