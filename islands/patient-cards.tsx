import cls from '../util/cls.ts'
import { Patient } from './recent.tsx'
import Card from '../components/library/Card.tsx'
import { Button } from '../components/library/Button.tsx'
import Avatar from '../components/library/Avatar.tsx'

function CardHeader(
  { name, imageUrl }: { name: string, imageUrl: string }
) {
  return (
    <div className='flex gap-3 items-center'>
      <div className='flex-shrink-0'>
        <Avatar
          src={imageUrl}
          className='h-10 w-10'
        />
      </div>
      <p className='font-semibold text-gray-900 min-w-0 flex-1 flex'>
        {name}
      </p>
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
    <div className='flex items-end gap-7'>
      <div className="flex flex-col flex-1 min-w-0">
        {
          DISPLAYED_COLUMNS.map(column => (
            <div className='flex gap-3 justify-between'>
              <p className='font-semibold whitespace-nowrap'>{column.label}:</p>
              <p className='truncate text-gray-500'>{patient[column['dataKey']]}</p>
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
  { patients, className } : { patients: Patient[], className?: string }
) {
  return (
    <section className={cls(className, 'px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-3')}>
      { patients.map(patient => <PatientCard patient={patient} />) }
    </section>
  )
}