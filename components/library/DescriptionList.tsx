import { ComponentChildren } from 'preact'
import { Maybe } from '../../types.ts'

export type DescriptionListItemProps = {
  label: string
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
        className='grid gap-2'
        style={{
          gridTemplateColumns: 'max-content 1fr',
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
          ]
        )}
      </div>
    </>
  )
}
