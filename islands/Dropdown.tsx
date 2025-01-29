import { Fragment, JSX } from 'preact'
import { Menu } from '@headlessui/react'
import cls from '../util/cls.ts'

export type DropdownItem = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  title: string
  selected?: boolean
}

export type DropdownProps = {
  id?: string
  button: JSX.Element
  items: DropdownItem[]
}

function DropdownItem({ href, title, selected, ...props }: DropdownItem) {
  const baseStyles =
    'block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none hover:bg-gray-50'
  return (
    <Menu.Item>
      {href
        ? (
          <a
            href={href}
            {...(props as unknown as JSX.HTMLAttributes<HTMLAnchorElement>)}
            className={cls(baseStyles, selected && 'bg-gray-100')}
          >
            {title}
          </a>
        )
        : (
          <button
            {...props}
            className={baseStyles}
          >
            {title}
          </button>
        )}
    </Menu.Item>
  )
}

export default function Dropdown({
  id,
  button,
  items,
}: DropdownProps) {
  return (
    <Menu as='div' className='relative inline-block text-left' id={id}>
      <div>
        <Menu.Button as={Fragment}>
          {button}
        </Menu.Button>
      </div>
      <Menu.Items className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in'>
        <div className='py-1'>
          {items.map((item, index) => <DropdownItem key={index} {...item} />)}
        </div>
      </Menu.Items>
    </Menu>
  )
}
