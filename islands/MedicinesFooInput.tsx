import useAsyncSearch from './useAsyncSearch.tsx'
import { TextInput } from './form/Inputs.tsx'
import Table, { TableColumn } from '../components/library/Table.tsx'
import { RenderedMedicine } from '../types.ts'
import { EmptyState } from '../components/library/EmptyState.tsx'
import { Button } from '../components/library/Button.tsx'
import FormRow from './form/Row.tsx'
import { useEffect } from 'react';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const columns: TableColumn<RenderedMedicine>[] = [
  {
    label: 'Generic Name',
    data: (medicine: RenderedMedicine) => {
      if (medicine.recalled_at) {
        return `${medicine.generic_name} (recalled ${formatDate(medicine.recalled_at)})`;
      }
      return medicine.generic_name;
    },
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
    data: (medicine: RenderedMedicine) => {
      console.log(`Medicine ${medicine.generic_name} recalled_at:`, medicine.recalled_at);
      if (medicine.recalled_at) {
        return { text: 'Recalled', disabled: true };
      }
      return {
        text: 'Recall',
        href: medicine.actions.recall,
        disabled: false
      };
    },
  },
]

export function MedicinesFooInput(
  { medicines, searchQuery }: { medicines: RenderedMedicine[], searchQuery: string },
) {
  console.log('Medicines data:', medicines);
  const { search, setSearch } = useAsyncSearch({
    href: '/drugs',
    value: null,
  })

  useEffect(() => {
    if (searchQuery) {
      setSearch({ ...search, query: searchQuery });
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('search', query);
    url.searchParams.set('page', '1');
    window.location.href = url.toString();
  };

  return (
    <div className='mb-4'>
      <FormRow className='mb-4'>
        <TextInput 
          name='search'
          value={search.query}
          onInput={(e) => {
            setSearch({ ...search, query: e.currentTarget.value })
          }}
        />
        <Button onClick={() => handleSearch(search.query)}>Search</Button>
      </FormRow>
      <Table
        columns={columns}
        rows={medicines}
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