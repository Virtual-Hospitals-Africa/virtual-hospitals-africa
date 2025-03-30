import cls from '../util/cls.ts'
import Card from '../components/library/Card.tsx'
import Avatar from '../components/library/Avatar.tsx'
import { Maybe, RenderedPatient } from '../types.ts'

const DISPLAYED_COLUMNS: {
  label: string
  data: keyof RenderedPatient
}[] = [
  {
    label: 'Patient ID',
    data: 'id',
  },
  {
    label: 'Last Visit',
    data: 'last_visited',
  },
  {
    label: 'Nearest Organization',
    data: 'nearest_organization',
  },
]

export function CardHeader(
  { name, avatar_url }: { name: Maybe<string>; avatar_url?: Maybe<string> },
) {
  return (
    <div className='flex gap-3 items-center'>
      {avatar_url && (
        <div className='flex-shrink-0'>
          <Avatar
            src={avatar_url}
            className='h-10 w-10 object-cover'
          />
        </div>
      )}
      <p className='font-semibold text-gray-900 min-w-0 flex-1 flex'>
        {name}
      </p>
    </div>
  )
}

function CardBody(
  { patient }: { patient: RenderedPatient },
) {
  return (
    <div className='flex items-end gap-7'>
      <div className='flex flex-col flex-1 min-w-0'>
        {DISPLAYED_COLUMNS.map((column) => (
          <div className='flex gap-3 justify-between'>
            <p className='font-semibold text-gray-500 whitespace-nowrap'>
              {column.label}:
            </p>
            <p className='truncate text-gray-500'>
              {patient[column['data']]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientCard(
  { patient }: { patient: RenderedPatient },
) {
  return (
    <a href={`/app/patients/${patient.id}`}>
      <Card orientation='vertical' className='shadow-lg'>
        <CardHeader name={patient.name} avatar_url={patient.avatar_url} />
        <CardBody patient={patient} />
      </Card>
    </a>
  )
}

export default function PatientCards(
  { patients, className }: { patients: RenderedPatient[]; className?: string },
) {
  return (
    <section
      className={cls(
        className,
        'sm:px-6 lg:px-8 mt-8 flex flex-col gap-3',
      )}
    >
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </section>
  )
}
