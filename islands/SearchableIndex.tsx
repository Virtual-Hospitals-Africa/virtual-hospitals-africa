import { JSX } from 'preact'
import { Combobox } from '@headlessui/react'
import { assert } from 'std/assert/assert.ts'
import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'
import { Maybe } from '../types.ts'
import isObjectLike from '../util/isObjectLike.ts'
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '../components/library/icons/heroicons/outline.tsx'
import { ICD10Searchable } from '../shared/icd10.ts'
import { computed, useSignal } from '@preact/signals'

function Internal({ icd10_searchable }: {
  icd10_searchable: ICD10Searchable
}) {
  const query = useSignal('')

  const results = computed(() => {
    return icd10_searchable.search(query.value)
  })

  console.log(results.value)

  return (
    <Combobox>
      <div className='grow'>
        <Combobox.Label className='block text-sm font-medium leading-6 text-gray-500 mb-0 ml-0.5'>
          ICD 10 Search
        </Combobox.Label>
        <div className='relative'>
          <Combobox.Input
            className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            onChange={(
              event,
            ) => {
              assert(event.target instanceof HTMLInputElement)
              query.value = event.target.value
            }}
          />
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>

          {(results.value.length > 0) && (
            <Combobox.Options className='absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {results.value.map((option) => (
                <Combobox.Option
                  key={option.term}
                  value={option}
                  className={({ active }) =>
                    cls(
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    )}
                >
                  {({ active, selected }) => (
                    <>
                      {JSON.stringify(option)}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </div>
    </Combobox>
  )
}

export default function SearchableIndex({
  serialized_icd10_searchable,
}: {
  serialized_icd10_searchable: any
}) {
  const icd10_searchable = ICD10Searchable.deserialize(
    serialized_icd10_searchable,
  )

  console.log(icd10_searchable)
  return <Internal icd10_searchable={icd10_searchable} />
}
