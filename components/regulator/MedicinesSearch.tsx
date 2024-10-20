import { TextInput } from '../../islands/form/Inputs.tsx'
import { Button } from '../library/Button.tsx'
import FormRow from '../library/FormRow.tsx'
import type { Maybe } from '../../types.ts'

export function MedicinesSearch({ search }: { search?: Maybe<string> }) {
  return (
    <FormRow className='mb-4'>
      <TextInput
        name='search'
        placeholder='Search Medicines'
        value={search}
      />
      <Button className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'>
        Search
      </Button>
    </FormRow>
  )
}
