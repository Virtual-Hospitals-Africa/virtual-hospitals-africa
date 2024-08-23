import useAsyncSearch from './useAsyncSearch.tsx'
import { TextInput } from './form/Inputs.tsx'
import Table, { TableColumn } from '../components/library/Table.tsx'
import { RenderedMedicine } from '../types.ts'
import { EmptyState } from '../components/library/EmptyState.tsx'

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

export function MedicinesFooInput(
  { medicines }: { medicines: RenderedMedicine[] },
) {
  const { search, setSearch } = useAsyncSearch({
    href: '/drugs',
    value: null,
  })

  console.log('search', search)
  return (
    <>
      <TextInput
        name='search'
        onInput={(e) => {
          setSearch({ ...search, query: e.currentTarget.value })
        }}
      />
      <Table
        columns={columns}
        rows={search.query ? (search.results as any) : medicines}
        EmptyState={() => (
          <EmptyState
            header='No medicines'
            explanation='Add a medicine to get started'
            button={{ text: 'Add Medicine', href: '/foo' }}
            icon={<p>Get off my lawn!</p>}
          />
        )}
      />
    </>
  )
}
