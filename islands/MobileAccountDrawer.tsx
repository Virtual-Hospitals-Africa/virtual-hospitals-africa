import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import Avatar from '../components/library/Avatar.tsx'
import { LogoWithFullText } from '../components/library/Logo.tsx'
import { ArrowRightOnRectangleIcon, UserIcon } from '../components/library/icons/heroicons/outline.tsx'
import type { Maybe } from '../types.ts'

export function MobileAccountDrawer({
  avatar_url,
  display_name,
  description,
  profile_href,
}: {
  avatar_url: Maybe<string>
  display_name: string
  description: string
  profile_href: string
}) {
  const open = useSignal(false)

  useEffect(() => {
    if (!open.value) return
    const previous_overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function on_key(event: KeyboardEvent) {
      if (event.key === 'Escape') open.value = false
    }
    document.addEventListener('keydown', on_key)
    return () => {
      document.body.style.overflow = previous_overflow
      document.removeEventListener('keydown', on_key)
    }
  }, [open.value])

  return (
    <>
      <button
        type='button'
        aria-label='Account'
        aria-expanded={open.value}
        onClick={() => {
          open.value = true
        }}
        className='flex size-9 shrink-0 items-center justify-center'
      >
        <Avatar
          src={avatar_url}
          size='lg'
          className='border-2 border-gray-200'
        />
      </button>
      {open.value && (
        <div className='md:hidden'>
          <button
            type='button'
            aria-label='Close account menu'
            className='fixed inset-0 z-40 bg-[#101828]/75'
            onClick={() => {
              open.value = false
            }}
          />
          <aside className='fixed top-0 right-0 z-50 flex h-full w-[200px] flex-col rounded-l-2xl border-l border-gray-200 bg-white pt-2 pb-4 shadow-[0_60px_45px_rgba(72,85,99,0.1)]'>
            <a href='/app' className='flex justify-center px-2'>
              <LogoWithFullText variant='indigo' className='h-[72px] w-[160px]' />
            </a>
            <nav className='mt-6 flex flex-col gap-1.5 px-[13px]'>
              <a
                href={profile_href}
                className="flex items-center gap-2 px-1 py-2 font-['Inter'] text-sm font-medium leading-5 text-gray-500"
              >
                <UserIcon className='size-6!' />
                Profile
              </a>
              <a
                href='/app/logout'
                className="flex items-center gap-2 px-1 py-2 font-['Inter'] text-sm font-medium leading-5 text-gray-500"
              >
                <ArrowRightOnRectangleIcon className='size-6!' />
                Log out
              </a>
            </nav>
            <div className='mx-[14px] mt-auto flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 p-3'>
              <Avatar
                src={avatar_url}
                size='md'
                className='border-2 border-gray-200'
              />
              <div className='min-w-0'>
                <p className="truncate font-['Inter'] text-sm font-semibold leading-5 text-[#1e2939]">
                  {display_name}
                </p>
                <p className="truncate font-['Inter'] text-xs font-normal leading-4 text-[#1e2939]">
                  {description}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
