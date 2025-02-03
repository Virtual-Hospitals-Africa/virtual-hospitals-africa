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
    : null

  return (
    <a
      href={`#request_review_from_organization_id=${organization.id}`}
      className={className}
    >
      <div className='flex flex-col'>
        <div className={cls('text-base', selected && 'font-bold')}>
          {organization.name}
        </div>
        <div className={cls('text-xs flex', selected && 'font-bold')}>
          {organization.address || organization.description}
          {organization.google_maps_link && (
            <a href={organization.google_maps_link}>
              ({km}km)
            </a>
          )}
        </div>
      </div>
    </a>
  )
}
