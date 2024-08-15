import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patients from '../../db/models/patients.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail.tsx'

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
  const medications = [
    {
      id: '14c1923a-f9ae-4bdb-8ec7-c0a209af9a63',
      patient_condition_id: '5a9b85e7-cf04-4f79-8d8c-1145f6aa7610',
      medication_id: 'a798a1cf-c37a-43d7-a6be-679629d34ff1',
      strength: 20,
      route: 'INFUSION',
      special_instructions: 'Left buttcheek, then right buttcheek',
      start_date: '2002-07-07',
      schedules: '(2,nocte,683,days)',
    },
    {
      id: '07345a28-87f7-4c5b-859e-62b871747eba',
      patient_condition_id: '5a9b85e7-cf04-4f79-8d8c-1145f6aa7610',
      medication_id: 'a3efea2a-9079-473a-8a7f-9ebdbd06471d',
      strength: 0.25,
      route: 'ORAL',
      special_instructions: 'Instruction 1',
      start_date: '0003-01-02',
      schedules: '(1,ac,1,indefinitely)',
    },
  ]

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
                information={`${
                  new Date().getFullYear() -
                  new Date('patient.date_of_birth').getFullYear()
                }`}
              />
            </div>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Phone Number'
                information={patient.phone_number
                  ? patient.phone_number
                  : 'N/A'}
              />
              <PrescriptionDetail
                heading='Date of Birth'
                information={new Date('patient.date_of_birth')
                  .toLocaleDateString()}
              />
            </div>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Email'
                information={'patient.email'}
              />
              <PrescriptionDetail
                heading='Gender'
                information={patient.gender ? patient.gender : 'Nan'}
              />
            </div>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Address'
                information={'patient.address'}
              />
            </div>
            <div class='flex justify-between mb-2'>
              <PrescriptionDetail
                heading='Allergies'
                information={'patient.allergies'}
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
          <div style={{ marginBottom: '20px' }}>
            <div class='text-purple-900 mb-2 font-bold'>
              List of Prescribed Medications
            </div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Medication Name
                  </th>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Strength
                  </th>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Route
                  </th>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Special Instructions
                  </th>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Start Date
                  </th>
                  <th
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      backgroundColor: '#f4f4f4',
                    }}
                  >
                    Schedules
                  </th>
                </tr>
              </thead>
              <tbody>
                {medications.map((medication, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {medication.medication_id}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {medication.strength}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {medication.route}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {medication.special_instructions}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {new Date(medication.start_date).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      {medication.schedules}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
