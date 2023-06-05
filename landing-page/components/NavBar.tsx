import { useEffect, useRef, useState } from 'preact/hooks'
// import { Popover } from '@headlessui/react'
import cls from '../../util/cls.ts'

const sections = [
  {
    id: 'table-of-contents',
    title: (
      <>
        <span className='hidden lg:inline'>Table of contents</span>
        <span className='lg:hidden'>Contents</span>
      </>
    ),
  },
  { id: 'screencasts', title: 'Screencasts' },
  { id: 'resources', title: 'Resources' },
  { id: 'pricing', title: 'Pricing' },
  { id: 'partners', title: 'Partners' },
]

function MenuIcon({ open, ...props }: any) {
  return (
    <svg
      aria-hidden='true'
      fill='none'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        d={open ? 'M17 7 7 17M7 7l10 10' : 'm15 16-3 3-3-3M15 8l-3-3-3 3'}
      />
    </svg>
  )
}

export function NavBar() {
  let navBarRef = useRef()
  let [activeIndex, setActiveIndex] = useState(null)
  let mobileActiveIndex = activeIndex === null ? 0 : activeIndex

  useEffect(() => {
    function updateActiveIndex() {
      let newActiveIndex = null
      let elements = sections.map(({ id }) => document.getElementById(id))
      let bodyRect = document.body.getBoundingClientRect()
      // @ts-ignore
      let offset = bodyRect.top + navBarRef.current.offsetHeight + 1

      if (window.scrollY >= Math.floor(bodyRect.height) - window.innerHeight) {
        // @ts-ignore
        setActiveIndex(sections.length - 1)
        return
      }

      for (let index = 0; index < elements.length; index++) {
        if (
          window.scrollY >=
            // @ts-ignore
            elements[index].getBoundingClientRect().top - offset
        ) {
          newActiveIndex = index
        } else {
          break
        }
      }

      // @ts-ignore
      setActiveIndex(newActiveIndex)
    }

    updateActiveIndex()

    window.addEventListener('resize', updateActiveIndex)
    window.addEventListener('scroll', updateActiveIndex, { passive: true })

    return () => {
      window.removeEventListener('resize', updateActiveIndex)
      window.removeEventListener('scroll', updateActiveIndex)
    }
  }, [])

  return (
    <div ref={navBarRef as any} className='sticky top-0 z-50'>
      <div className='hidden sm:flex sm:h-32 sm:justify-center sm:border-b sm:border-slate-200 sm:bg-white/95 sm:[@supports(backdrop-filter:blur(0))]:bg-white/80 sm:[@supports(backdrop-filter:blur(0))]:backdrop-blur'>
        <ol
          role='list'
          className='mb-[-2px] grid auto-cols-[minmax(0,15rem)] grid-flow-col text-base font-medium text-slate-900 [counter-reset:section]'
        >
          {sections.map((section, sectionIndex) => (
            <li key={section.id} className='flex [counter-increment:section]'>
              <a
                href={`#${section.id}`}
                className={cls(
                  'flex w-full flex-col items-center justify-center border-b-2 before:mb-2 before:font-mono before:text-sm before:content-[counter(section,decimal-leading-zero)]',
                  sectionIndex === activeIndex
                    ? 'border-blue-600 bg-blue-50 text-blue-600 before:text-blue-600'
                    : 'border-transparent before:text-slate-500 hover:bg-blue-50/40 hover:before:text-slate-900',
                )}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
