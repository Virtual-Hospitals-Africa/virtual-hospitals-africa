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
      className={cls('flex gap-2 md:gap-4 items-start w-full', className)}
    >
      <SectionHeader className='w-[120px] md:w-[200px] lg:w-[285px] shrink-0'>
        {header}
      </SectionHeader>
      <div className='flex flex-col gap-8 flex-1 min-w-0'>
        {children}
      </div>
    </section>
  )
}
