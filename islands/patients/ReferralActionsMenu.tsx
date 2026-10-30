import type { JSX } from 'preact'
import { Menu } from '@headlessui/react'
import { EllipsisVerticalIcon } from '../../components/library/icons/heroicons/outline.tsx'

function MenuContainer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

const ITEM_CLASS =
  'block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none'

const MENU_CLASS =
  'z-50 w-max origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition [--anchor-gap:8px] focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in'

export function ReferralActionsMenu(
  { profile_href, message_href }: { profile_href: string; message_href: string },
) {
  return (
    <Menu as={MenuContainer} className='relative inline-block text-left'>
      <Menu.Button
        id='patient-case-referral-more'
        type='button'
        aria-label='More referral actions'
        className='flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      >
        <EllipsisVerticalIcon />
      </Menu.Button>
      <Menu.Items anchor='bottom end' unmount={false} className={MENU_CLASS}>
        <div className='py-1'>
          <Menu.Item>
            <a id='patient-case-referral-profile' href={profile_href} className={ITEM_CLASS}>
              Profile
            </a>
          </Menu.Item>
          <Menu.Item>
            <a id='patient-case-referral-message' href={message_href} className={ITEM_CLASS}>
              Message
            </a>
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
