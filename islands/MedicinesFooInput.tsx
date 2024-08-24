import useAsyncSearch from './useAsyncSearch.tsx'
import { TextInput } from './form/Inputs.tsx'
import Table, { TableColumn } from '../components/library/Table.tsx'
import { RenderedMedicine } from '../types.ts'
import { EmptyState } from '../components/library/EmptyState.tsx'
import { Button } from '../components/library/Button.tsx'
import FormRow from './form/Row.tsx'

const columns: TableColumn<RenderedMedicine>[] = [
  {
    label: 'Generic Name',
    data: 'generic_name',
  },
  {
    label: 'Trade Name',
    data: 'trade_name',
  },
  {
    label: 'Applicant Name',
    data: 'applicant_name',
  },
  {
    label: 'Form',
    data: 'form',
  },
  {
    label: 'Strength Summary',
    data: 'strength_summary',
  },
  {
    label: 'Actions',
    type: 'actions',
  },
]

type MedicinesFooInputProps = {
  medicines: RenderedMedicine[]
  pathname: string
}

export function MedicinesFooInput({ medicines, pathname }: MedicinesFooInputProps) {
  const { search, setSearch } = useAsyncSearch({
    href: '/drugs',
    value: null,
  })
  const filteredMedicines = search.query
  ? medicines.filter((medicine) =>
    search.results.some((result) => result.name === medicine.generic_name)
  )
  : medicines
  console.log('pathname', pathname)
  console.log('search', search)
  return (
    <div className='mb-4'>
      <FormRow className='mb-4'>
        <TextInput 
          name='search'
          onInput={(e) => {
            setSearch({ ...search, query: e.currentTarget.value })
          }}
        />

      </FormRow>
      <Table
        columns={columns}
        rows={filteredMedicines}
        EmptyState={() => (
          <EmptyState
            header='No medicines'
            explanation='Add a medicine to get started'
            button={{ text: 'Add Medicine', href: '/foo' }}
            icon={<p>Get off my lawn!</p>}
          />
        )}
      />
    </div>
  )
}