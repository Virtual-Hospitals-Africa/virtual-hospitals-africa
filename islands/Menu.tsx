import { JSX } from 'preact'
import { useState } from 'preact/hooks'
import cls from '../util/cls.ts'

type MenuOption = {
  label: string
  href: string
  icon?: JSX.Element
}

type MenuProps = {
  options: MenuOption[]
  className?: string
}

export function MenuOptions({ options }: MenuProps) {
  return (
    <div
      className='absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
      role='menu'
      aria-orientation='vertical'
      aria-labelledby='menu-0-button'
      tabIndex={-1}
    >
      <div className='py-1' role='none'>
        {/* <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" --> */}
        {options.map((option, i) => (
          <a
            href={option.href}
            className='text-gray-700 block px-4 py-2 text-sm'
            role='menuitem'
            tabIndex={-1}
            id='menu-0-item-0'
          >
            {option.icon && <span className='mr-2'>{option.icon}</span>}
            {option.label}
          </a>
        ))}
      </div>
    </div>
  )
}

/* Dropdown menu, show/hide based on menu state.

    Entering: "transition ease-out duration-100"
      From: "transform opacity-0 scale-95"
      To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
      From: "transform opacity-100 scale-100"
      To: "transform opacity-0 scale-95" */
export default function Menu({ options, className }: MenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={cls(
        'absolute right-0 top-6 xl:relative xl:right-auto xl:top-auto xl:self-center',
        className,
      )}
    >
      <div>
        <button
          type='button'
          className='-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600'
          id='menu-0-button'
          aria-expanded={showMenu}
          aria-haspopup='true'
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className='sr-only'>Open options</span>
          <svg
            className='h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path d='M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z' />
          </svg>
        </button>
      </div>
      {showMenu && <MenuOptions options={options} />}
    </div>
  )
}
