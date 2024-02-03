import { useEffect, useRef, useState } from 'preact/hooks'
import cls from '../../util/cls.ts'
import { assert } from 'std/assert/assert.ts'
import { ChevronUpDownIcon } from '../../components/library/icons/heroicons/outline.tsx'
import sections from '../../components/landing-page/sections.tsx'

const sectionIds = Object.keys(
  sections,
) as unknown as Array<keyof typeof sections>

export default function NavBar() {
  const navBarRef = useRef<HTMLElement>()
  const [activeIndex, setActiveIndex] = useState<null | number>(null)
  const mobileActiveIndex = activeIndex ?? 0

  useEffect(() => {
    function updateActiveIndex() {
      let newActiveIndex = null
      const elements = sectionIds.map((id) => {
        const element = document.getElementById(id)
        assert(element, `No element found with id "${id}"`)
        return element
      })
      const bodyRect = document.body.getBoundingClientRect()

      assert(navBarRef.current)
      const offset = bodyRect.top + navBarRef.current.offsetHeight + 1

      if (scrollY >= Math.floor(bodyRect.height) - innerHeight) {
        setActiveIndex(sectionIds.length - 1)
        return
      }

      for (let index = 0; index < elements.length; index++) {
        if (
          scrollY >=
            elements[index].getBoundingClientRect().top - offset
        ) {
          newActiveIndex = index
        } else {
          break
        }
      }

      setActiveIndex(newActiveIndex)
    }

    updateActiveIndex()

    addEventListener('resize', updateActiveIndex)
    addEventListener('scroll', updateActiveIndex, { passive: true })

    return () => {
      removeEventListener('resize', updateActiveIndex)
      removeEventListener('scroll', updateActiveIndex)
    }
  }, [])

  const [open, setOpen] = useState(false)

  return (
    // deno-lint-ignore no-explicit-any
    <div ref={navBarRef as any} className='sticky top-0 z-50 bg-white'>
      <div className='sm:hidden'>
        <div
          className={cls(
            'relative flex items-center px-4 py-3',
            !open &&
              'bg-white/95 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-white/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur',
          )}
        >
          {!open && (
            <>
              <span
                aria-hidden='true'
                className='font-mono text-sm text-blue-600'
              >
                {sections[sectionIds[mobileActiveIndex]].icon}
              </span>
              <span className='ml-4 text-base font-medium text-slate-900'>
                {sections[sectionIds[mobileActiveIndex]].displayName}
              </span>
            </>
          )}
          <button
            className={cls(
              '-mr-1 ml-auto flex h-8 w-8 items-center justify-center',
              open && 'relative z-10',
            )}
            aria-label='Toggle navigation menu'
            onClick={() => setOpen((open) => !open)}
          >
            {!open && (
              <>
                {/* Increase hit area */}
                <span className='absolute inset-0' />
              </>
            )}
            <ChevronUpDownIcon
              open={open}
              className='h-6 w-6 stroke-slate-700'
            />
          </button>
        </div>
        <div
          className={cls(
            'absolute inset-x-0 top-0 bg-white py-1.5 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-white/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur',
            !open && 'hidden',
          )}
        >
          {Object.entries(sections).map(([name, section]) => (
            <a
              key={name}
              href={section.href}
              className='flex items-center px-4 py-1.5'
              onClick={() => setOpen(false)}
            >
              <span
                aria-hidden='true'
                className='font-mono text-sm text-blue-600'
              >
                {section.icon}
              </span>
              <span className='ml-4 text-base font-medium text-slate-900'>
                {section.displayName}
              </span>
            </a>
          ))}
        </div>
        <div className='absolute inset-x-0 bottom-full z-10 h-4 bg-white' />
      </div>
      <div className='hidden sm:flex sm:h-32 sm:justify-center sm:border-b sm:border-slate-200 sm:bg-white/95 sm:[@supports(backdrop-filter:blur(0))]:bg-white/80 sm:[@supports(backdrop-filter:blur(0))]:backdrop-blur'>
        <ol
          role='list'
          className='mb-[-2px] grid auto-cols-[minmax(0,15rem)] grid-flow-col text-base font-medium text-slate-900 [counter-reset:section]'
        >
          {Object.entries(sections).map(([name, section], sectionIndex) => (
            <li key={name} className='flex [counter-increment:section]'>
              <a
                href={section.href}
                className={cls(
                  'flex w-full flex-col items-center justify-center border-b-2 before:mb-2 before:font-mono before:text-sm',
                  sectionIndex === activeIndex
                    ? 'border-blue-600 bg-blue-50 text-blue-600 before:text-blue-600'
                    : 'border-transparent bg-white before:text-slate-500 hover:bg-blue-50/40 hover:before:text-slate-900',
                )}
              >
                {section.displayName}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
