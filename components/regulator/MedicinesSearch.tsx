import { Button } from '../library/Button.tsx'
import FormRow from '../library/FormRow.tsx'
import type { Maybe } from '../../types.ts'
import { TextInput } from '../../islands/form/inputs/text.tsx'

export function MedicinesSearch({ search }: { search?: Maybe<string> }) {
  return (
    <FormRow className='mb-4'>
      <TextInput
        name='search'
        placeholder='Search Medicines'
        value={search}
      />
      <Button className='grid self-end p-2 text-white border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center'>
        Search
      </Button>
    </FormRow>
  )
}
