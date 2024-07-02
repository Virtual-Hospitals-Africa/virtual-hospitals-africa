import { JSX } from 'preact'
import Table from '../library/Table.tsx'
import { TableColumn } from '../library/Table.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../../islands/form/Row.tsx'
import { SearchInput } from '../../islands/form/Inputs.tsx'
import { UserCircleIcon } from '../library/icons/heroicons/outline.tsx'
import { EmptyState } from '../library/EmptyState.tsx'

type Pharmacist = {
  license_number: string
  prefix: string | 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Miss' | 'Sr'
  given_name: string
  family_name: string
  address: string
  town: string
  expiry_date: string
  pharmacist_type: string | 'Dispensing Medical Practitioner' | 'Ind Clinic Nurse' | 'Pharmacist' | 'Sales Representative' | 'Pharmacy Technician' | 'Veterinary Surgeon' 
}

type PharmacistsTableProps = {
  isAdmin: boolean
  pharmacists: Pharmacist[]
  pathname: string
}

export default function PharmacistsTable({
  isAdmin,
  pharmacists,
  pathname,
}: PharmacistsTableProps): JSX.Element {
  const columns: TableColumn<Pharmacist>[] = [
    {
      label: 'Prefix',
      data(row) {
        return row.prefix
      },
      },
      {
        label: 'Given Name',
        data(row) {
          return row.given_name
        },
      },
      {
        label: 'Family Name',
        data(row) {
          return row.family_name
        },
      },
      {
        label: 'Address',
        data(row) {
          return row.address
        },
      },
      {
        label: 'Town',
        data(row) {
          row.town
        },
      },
      {
        label: 'License Number',
        data(row) {
          return row.license_number
        },
      },
      {
        label: 'Expiry Date',
        data(row) {
          return row.expiry_date
        },
      },
      {
        label: 'Pharmacist Type',
        data(row) {
          return row.pharmacist_type
        },
      },
  ]
  return (
    <>
      <FormRow className='mb-4'>
        <SearchInput />
        {isAdmin &&
          (
            <Button
              type='button'
              href={'${pathname}/invite'} 
              className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
            >
              Invite
            </Button>
          )}
      </FormRow>
      <Table
        columns={columns}
        rows={pharmacists}
        EmptyState={() => (
          <EmptyState
            header='No pharmacists'
            explanation='Invite a pharmacist to get started'
            Icon={UserCircleIcon}
          />  
        )}
      />  
    </>
  )
}
