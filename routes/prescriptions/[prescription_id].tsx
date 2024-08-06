import { FreshContext } from '$fresh/server.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import * as prescriptions from '../../db/models/prescriptions.ts'
import * as patients from '../../db/models/patients.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'

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
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          margin: 0,
          padding: 0,
          backgroundColor: '#f4f4f4',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          marginTop: '500px',
          marginBottom: '500px',
        }}
      >
        <div
          style={{
            width: '800px',
            background: 'white',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#8b0a50',
              marginBottom: '20px',
              borderBottom: '2px solid #f4f4f4',
              paddingBottom: '10px',
            }}
          >
            <h1>PRESCRIPTION TEMPLATE</h1>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p>
                  <strong>Prescription No.:</strong> {prescription.id}
                </p>
              </div>
              <div>
                <p>
                  <strong>Prescription Date:</strong>{' '}
                  {new Date(prescription.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              Patient Information
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p>
                  <strong>Name:</strong> {patient.name}
                </p>
                <p>
                  <strong>Phone Number:</strong> {patient.phone_number}
                </p>
                <p>
                  <strong>Email:</strong> {'patient.email'}
                </p>
                <p>
                  <strong>Address:</strong> {'patient.address'}
                </p>
                <p>
                  <strong>Allergies:</strong> {'patient.allergies'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Age:</strong> {new Date().getFullYear() -
                    new Date('patient.date_of_birth').getFullYear()}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{' '}
                  {new Date('patient.date_of_birth').toLocaleDateString()}
                </p>
                <p>
                  <strong>Gender:</strong> {patient.gender}
                </p>
                <p>
                  <strong>Notable Health Condition:</strong>{' '}
                  {'patient.health_conditions'}
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              borderTop: '2px solid #f4f4f4',
              paddingTop: '10px',
            }}
          >
            <div>
              <p>
                <strong>Physician Name:</strong> {prescriber}
              </p>
              <p>
                <strong>Physician Phone Number:</strong>{' '}
                {'prescriber.phone_number'}
              </p>
              <p>
                <strong>Physician Email:</strong> {'prescriber.email'}
              </p>
              <p>
                <strong>Physician Signature:</strong> __________________
              </p>
            </div>
            <div>
              <p>
                <strong>Prescription Date:</strong>{' '}
                {new Date(prescription.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
