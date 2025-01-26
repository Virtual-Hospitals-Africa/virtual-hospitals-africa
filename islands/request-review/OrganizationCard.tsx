import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import cls from '../../util/cls.ts'

// TODO @mike implementing the info on the card
export function OrganizationCard({ organization, selected, className }: {
  organization: NearestOrganizationSearchResult
  selected?: boolean
  className?: string
}) {
  return (
    <a
      href={`#request_review_from_organization_id=${organization.id}`}
      className={className}
    >
      <div className='flex flex-col'>
        <div className={cls('text-base', selected && 'font-bold')}>
          {organization.name}
        </div>
        <div className={cls('text-xs', selected && 'font-bold')}>
          {organization.address} {organization.distance_meters}{' '}
          {organization.google_maps_link}
        </div>
      </div>
    </a>
  )
}
