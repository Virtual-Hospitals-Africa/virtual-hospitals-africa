import { Context } from 'fresh'
import { getMockPatientByKey, MOCK_PATIENTS } from '../../../mocks/data/patients.ts'
import { ExamplePatientView } from '../../../islands/ExamplePatientView.tsx'

type PageData = {
  patient_case: string
}

export default function ExamplePatientPage(ctx: Context<PageData>) {
  const patient_case = ctx.params.patient_case
  const mock_patient = getMockPatientByKey(patient_case)

  if (!mock_patient) {
    return (
      <div className='min-h-screen bg-gray-100 p-8'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Patient Case Not Found</h1>
          <p className='text-gray-600 mb-6'>
            The patient case "{patient_case}" was not found.
          </p>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>Available Patient Cases:</h2>
          <ul className='space-y-2'>
            {MOCK_PATIENTS.map((patient) => (
              <li key={patient.key}>
                <a
                  href={`/example/patients/${patient.key}`}
                  className='text-blue-600 hover:text-blue-800 underline'
                >
                  {patient.key}
                </a>
                <span className='text-gray-500 ml-2'>- {patient.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <ExamplePatientView
      url={ctx.url}
      route={ctx.route!}
      mock_patient={mock_patient}
    />
  )
}
