import { ComponentChildren } from 'preact'
import type { HTMLAttributes } from 'preact/compat'

import SectionHeader from './typography/SectionHeader.tsx'
import cls from '../../util/cls.ts'

export default function Form(
  { className, header, children, ...props }: HTMLAttributes<HTMLElement> & {
    className?: string
    header: string
    children: ComponentChildren
  },
) {
  return (
    <section
      {...props}
      className={cls(
        'flex flex-col xl:flex-row gap-4 xl:gap-12 items-start w-full',
        className,
      )}
    >
      <SectionHeader className='w-full xl:w-60'>
        {header}
      </SectionHeader>
      <div className='flex flex-col gap-8 grow min-w-0 w-full'>
        {children}
      </div>
    </section>
  )
}
