import { NearestOrganizationSearchResult } from '../../db/models/nearest_organizations.ts'
import Table, {
  ExtendedActionData,
  TableColumn,
} from '../../components/library/Table.tsx'
import AvatarGroup from '../../components/library/AvatarGroup.tsx'
import { OrganizationCard } from './OrganizationCard.tsx'
import cls from '../../util/cls.ts'
import Badge, { BadgeColor } from '../../components/library/Badge.tsx'

const StatusBadge = (row: NearestOrganizationSearchResult) => {
  let theme: BadgeColor
  let iconColor
  let message

  switch (row.wait.status) {
    case 'open (short wait)': {
      theme = 'green'
      iconColor = 'fill-green-500'
      message = `${row.wait.display} wait time`
      break
    }
    case 'open (long wait)': {
      theme = 'yellow'
      iconColor = 'fill-yellow-500'
      message = `${row.wait.display} wait time`
      break
    }
    case 'closing soon': {
      theme = 'yellow'
      iconColor = 'fill-yellow-500'
      message = (
        <div>
          <span className='block'>Close in {row.wait.display}</span>
          <span className='block'>{row.re_opens.display}</span>
        </div>
      )
      break
    }
    case 'closed': {
      theme = 'gray'
      iconColor = 'fill-gray-400'
      message = (
        <div>
          <div className='block'>Closed</div>
          <div className='block'>{row.re_opens.display}</div>
        </div>
      )
      break
    }
  }

  const badge_content = (
    <>
      <svg
        viewBox='0 0 6 6'
        aria-hidden='true'
        className={cls('w-[6px]', iconColor)}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {message}
    </>
  )

  return (
    <Badge
      content={badge_content}
      color={theme}
      round='md'
      classNames='gap-x-1.5'
    />
  )
}

const columns: TableColumn<NearestOrganizationSearchResult>[] = [
  {
    label: 'Organization',
    data: (row) => <OrganizationCard organization={row} />,
    cellClassName: 'mb-1 font-medium',
  },
  {
    label: 'Status (Wait time)',
    data(row) {
      return StatusBadge(row)
    },
  },
  {
    label: 'Doctors Available',
    data(row) {
      return (
        <AvatarGroup
          people={row.doctors.slice(0, 3)}
          plus_count={row.doctors.length - 3}
        />
      )
    },
  },
  {
    label: 'Actions',
    type: 'actions',
    data(row): ExtendedActionData {
      console.log('ewlkekwllkew')
      return {
        text: 'request review',
        href: `#request_review_from_organization_id=${row.id}`,
      }
    },
  },
]

export function OrganizationsTable(
  { organizations }: {
    organizations: NearestOrganizationSearchResult[]
  },
) {
  console.log('ZZZZZ', { organizations })
  return (
    <Table
      columns={columns}
      rows={organizations}
      EmptyState={() => (
        <p>No matching organizations found with those criteria.</p>
      )}
    />
  )
}
