import { ComponentChildren, JSX } from 'preact'

export type DescriptionListItemProps = {
  label: string
  children: ComponentChildren
}

function DescriptionListItem(
  props: DescriptionListItemProps,
): JSX.Element {
  return (
    <div className='px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0'>
      <dt className='text-sm font-medium leading-6 text-white'>
        {props.label}
      </dt>
      <dd className='mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0'>
        {props.children}
      </dd>
    </div>
  )
}

export default function DescriptionList(
  { items }: { items: DescriptionListItemProps[] },
) {
  return (
    <div>
      <div className='px-4 sm:px-0'>
        <h3 className='text-base font-semibold leading-7 text-white'>
          Applicant Information
        </h3>
        <p className='mt-1 max-w-2xl text-sm leading-6 text-gray-400'>
          Personal details and application.
        </p>
      </div>
      <div className='mt-6 border-t border-white/10'>
        <dl className='divide-y divide-white/10'>
          {items.map((item) => <DescriptionListItem {...item} />)}
        </dl>
      </div>
    </div>
  )
}
