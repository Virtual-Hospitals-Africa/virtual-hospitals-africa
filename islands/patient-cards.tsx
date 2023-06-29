import { Patient } from './recent.tsx'
import Card from '../components/library/Card.tsx'
import { Button } from '../components/library/Button.tsx'

function CardHeader(
  { name, imageUrl }: { name: string, imageUrl: string }
) {
  return (
    <div className='flex gap-3'>
      <div className='flex-shrink-0'>
        <img
          className='h-10 w-10 rounded-full'
          src={imageUrl}
          alt={`${name} avatar`}
        />
      </div>
      <div className='min-w-0 flex-1 flex items-center'>
        <p className='font-semibold text-gray-900'>
          {name}
        </p>
      </div>
    </div>
  )
}

const DISPLAYED_COLUMNS: {
  label: string,
  dataKey: keyof Patient
}[] = [
  {
    label: 'Patient ID',
    dataKey: 'id',
  },
  {
    label: 'Last Visit',
    dataKey: 'last_visited',
  },
  {
    label: 'AVH',
    dataKey: 'nearest_facility',
  },
]

function CardBody(
  { patient } : { patient: Patient }
) {
  return (
    <div className='flex items-end'>
      <div className="flex flex-col flex-1 min-w-0">
        {
          DISPLAYED_COLUMNS.map(column => (
            <div className='flex gap-3'>
              <p className='font-semibold'>{column.label}:</p>
              <p>{patient[column['dataKey']]}</p>
            </div>
          ))
        }
      </div>
      <Button
        href={`/app/patients/${patient.id}`}
        variant='solid'
        color='blue'
      >View</Button>
    </div>
  )
}

function PatientCard(
  { patient } : { patient: Patient }
) {
  return (
    <Card orientation='vertical' className='shadow-lg'>
      <CardHeader name={patient.name} imageUrl={patient.avatar_url} />
      <CardBody patient={patient} />
    </Card>
  )
}


export default function PatientCards(
  { patients } : { patients: Patient[] }
) {
  return (
    <section className='px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-3'>
      {
        patients.map(patient => <PatientCard patient={patient} />)
      }
    </section>
  )
}