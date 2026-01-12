import type { ComponentChild, ComponentChildren, JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import cls from '../util/cls.ts'
import { ChevronDownIcon } from '../components/library/icons/heroicons/solid.tsx'

type MenuOption = {
  label: string
  href: string
  icon?: JSX.Element
}

type MenuProps = {
  options: MenuOption[]
  className?: string
  buttonClassName?: string
  optionsClassName?: string
  button_contents?: ComponentChildren
  icon: 'ChevronDownIcon' | ComponentChild
}

export function MenuOptions(
  { options, className }: Pick<MenuProps, 'options'> & { className: string },
) {
  return (
    <div
      className={cls(
        'absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        className,
      )}
      role='menu'
      aria-orientation='vertical'
      aria-labelledby='menu-0-button'
      tabIndex={-1}
    >
      {/* <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" --> */}
      {options.map((option) => (
        <a
          href={option.href}
          className='text-gray-700 block px-4 py-2 text-sm hover:bg-indigo-100 first:rounded-t-md last:rounded-b-md'
          role='menuitem'
          tabIndex={-1}
          id='menu-0-item-0'
        >
          {option.icon && <span className='mr-2'>{option.icon}</span>}
          {option.label}
        </a>
      ))}
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
export default function Menu(
  {
    options,
    className,
    button_contents,
    buttonClassName,
    icon,
    optionsClassName,
  }: MenuProps,
) {
  const show_menu = useSignal(false)
  const menu_ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show_menu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menu_ref.current && !menu_ref.current.contains(event.target as Node)
      ) {
        show_menu.value = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show_menu])

  return (
    <div
      ref={menu_ref}
      className={cls(
        'absolute',
        className,
      )}
    >
      <div>
        <button
          type='button'
          className={cls(
            '-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600',
            buttonClassName,
          )}
          aria-expanded={show_menu}
          aria-haspopup='true'
          onClick={() => show_menu.value = !show_menu.value}
        >
          {button_contents}
          <span className='sr-only'>Open options</span>
          {icon === 'ChevronDownIcon' ? <ChevronDownIcon /> : icon}
        </button>
      </div>
      {show_menu.value && <MenuOptions options={options} className={optionsClassName || ''} />}
    </div>
  )
}
