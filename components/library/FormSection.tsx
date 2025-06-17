import { ComponentChildren, JSX } from 'preact'

import SectionHeader from './typography/SectionHeader.tsx'
import cls from '../../util/cls.ts'

export default function Form(
  { className, header, children, ...props }: JSX.HTMLAttributes<HTMLElement> & {
    className?: string
    header: string
    children: ComponentChildren
  },
) {
  return (
    <section {...props} className={cls('flex gap-12', className)}>
      <SectionHeader className='mb-2'>{header}</SectionHeader>
      <div>
        {children}
      </div>
    </section>
  )
}
