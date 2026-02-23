import { MOCK_PATIENTS } from '../../../mocks/data/patients.ts'

export default function ExamplePatientsIndexPage() {
  return (
    <div className='min-h-screen bg-gray-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Example Patient Cases</h1>
        <p className='text-gray-600 mb-8'>
          Select a patient case to view the warning signs page and patient drawer with mock data.
        </p>

        <div className='grid gap-4'>
          {MOCK_PATIENTS.map((patient) => (
            <a
              key={patient.key}
              href={`/example/patients/${patient.key}`}
              className='block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-center'>
                  <img
                    src={patient.patient.avatar_url ?? '/images/avatars/default.png'}
                    alt={patient.patient.name}
                    className='w-12 h-12 rounded-full mr-4'
                  />
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      {patient.patient.name}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {patient.patient.description}
                    </p>
                  </div>
                </div>
                {patient.priority && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      patient.priority === 'Emergency'
                        ? 'bg-red-100 text-red-800'
                        : patient.priority === 'Very urgent'
                        ? 'bg-orange-100 text-orange-800'
                        : patient.priority === 'Urgent'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {patient.priority}
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-600 mt-3'>{patient.description}</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                {patient.patient_history.pre_existing_conditions.slice(0, 3).map((condition) => (
                  <span
                    key={condition.id}
                    className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700'
                  >
                    {condition.displays.finding}
                  </span>
                ))}
                {patient.patient_history.pre_existing_conditions.length > 3 && (
                  <span className='text-xs text-gray-500'>
                    +{patient.patient_history.pre_existing_conditions.length - 3} more
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
