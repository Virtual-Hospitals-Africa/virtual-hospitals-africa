import { ComponentChildren } from 'preact'
import { Maybe } from '../../types.ts'

import { PencilSquareIcon } from './icons/heroicons/outline.tsx'

export type DescriptionListItemProps = {
  label: string
  edit_href: string
  children: Maybe<ComponentChildren>
}

export function DescriptionList(
  { title, items }: { title: string; items: DescriptionListItemProps[] },
) {
  return (
    <>
      <h3 className='text-base font-semibold leading-7 text-gray-900'>
        {title}
      </h3>
      <div
        className='grid gap-4'
        style={{
          width: 'max-content',
          alignItems: 'center',
          gridTemplateColumns: 'max-content 1fr min-content',
        }}
      >
        {items.flatMap((item) =>
          !item.children ? [] : [
            <dt className='text-sm font-semibold leading-6 text-gray-900'>
              {item.label}
            </dt>,
            <dd className='text-sm leading-6 text-gray-700'>
              {item.children}
            </dd>,
            <a href={item.edit_href} aria-label='edit'>
              <PencilSquareIcon className='w-4 h-4 text-gray-500' />
            </a>,
          ]
        )}
      </div>
    </>
  )
}
