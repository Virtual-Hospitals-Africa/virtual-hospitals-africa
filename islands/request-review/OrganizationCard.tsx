import { OrganizationLike } from '../../types.ts'
import cls from '../../util/cls.ts'

// TODO @mike implementing the info on the card
export function OrganizationCard({ organization, selected, className }: {
  organization: OrganizationLike
  selected?: boolean
  className?: string
}) {
  const km = typeof organization.distance_meters === 'number'
    ? (organization.distance_meters / 1000).toPrecision(1)
    : typeof organization.distance_meters === 'string'
    ? (parseInt(organization.distance_meters) / 1000).toPrecision(1)
    : null

  const href = organization.location
    ? `https://www.google.com/maps/search/?api=1&query=${organization.location.latitude},${organization.location.longitude}`
    : ''

  let description = organization.address || organization.description || ''

  if (description.length > 30) {
    description = description.substring(0, 30) + '...'
  }

  return (
    <a
      href={`#request_review_from_organization_id=${organization.id}`}
      className={className}
    >
      <div className='flex flex-col'>
        <div className={cls('text-base', selected && 'font-bold')}>
          {organization.name}
        </div>
        <div
          className={cls(
            'text-xs flex mb-1 text-gray-500 gap-2',
            selected && 'font-bold',
          )}
        >
          {description}
          {organization.google_maps_link && (
            <a
              href={href}
              className='flex gap-2 text-sky-600 items-center'
              target='_blank'
              rel='noopener noreferrer'
            >
              ({km}km)
              <svg
                width='10'
                height='10'
                viewBox='0 0 10 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4.5 2C4.63261 2 4.75979 2.05268 4.85355 2.14645C4.94732 2.24021 5 2.36739 5 2.5C5 2.63261 4.94732 2.75979 4.85355 2.85355C4.75979 2.94732 4.63261 3 4.5 3H1.5V8.5H7V5.5C7 5.36739 7.05268 5.24021 7.14645 5.14645C7.24021 5.05268 7.36739 5 7.5 5C7.63261 5 7.75979 5.05268 7.85355 5.14645C7.94732 5.24021 8 5.36739 8 5.5V8.5C8 8.76522 7.89464 9.01957 7.70711 9.20711C7.51957 9.39464 7.26522 9.5 7 9.5H1.5C1.23478 9.5 0.98043 9.39464 0.792893 9.20711C0.605357 9.01957 0.5 8.76522 0.5 8.5V3C0.5 2.73478 0.605357 2.48043 0.792893 2.29289C0.98043 2.10536 1.23478 2 1.5 2H4.5ZM9 0.5C9.13261 0.5 9.25979 0.552678 9.35355 0.646447C9.44732 0.740215 9.5 0.867392 9.5 1V3.5C9.5 3.63261 9.44732 3.75979 9.35355 3.85355C9.25979 3.94732 9.13261 4 9 4C8.86739 4 8.74021 3.94732 8.64645 3.85355C8.55268 3.75979 8.5 3.63261 8.5 3.5V2.207L4.3535 6.3535C4.2592 6.44458 4.1329 6.49498 4.0018 6.49384C3.8707 6.4927 3.74529 6.44011 3.65259 6.34741C3.55989 6.25471 3.5073 6.1293 3.50616 5.9982C3.50502 5.8671 3.55542 5.7408 3.6465 5.6465L7.793 1.5H6.5C6.36739 1.5 6.24021 1.44732 6.14645 1.35355C6.05268 1.25979 6 1.13261 6 1C6 0.867392 6.05268 0.740215 6.14645 0.646447C6.24021 0.552678 6.36739 0.5 6.5 0.5H9Z'
                  fill='#087EFF'
                />
              </svg>
            </a>
          )}
        </div>
        <div
          className={cls('text-[11px] text-gray-500', selected && 'font-bold')}
        >
          {organization.business_hours}
        </div>
      </div>
    </a>
  )
}
