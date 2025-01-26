import { GoogleMapsIcon } from '../../components/library/icons/GoogleMaps.tsx'
import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import cls from '../../util/cls.ts'

// TODO @mike implementing the info on the card
export function OrganizationCard({ organization, selected, className }: {
  organization: NearestOrganizationSearchResult
  selected?: boolean
  className?: string
}) {
  const km = (organization.distance_meters / 1000).toPrecision(1)
  console.log('in here')

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
          <GoogleMapsIcon />
          {organization.address}
          <a href={organization.google_maps_link}>
            ({km}km)
          </a>
        </div>
      </div>
    </a>
  )
}
