import { ComponentChildren } from 'preact'
import type { HTMLAttributes } from 'preact/compat'

import SectionHeader from './typography/SectionHeader.tsx'

export default function Form(
  { className, header, children, ...props }: HTMLAttributes<HTMLElement> & {
    className?: string
    header: string
    children: ComponentChildren
  },
) {
  return (
    <section {...props} className={className}>
      <SectionHeader className='mb-2'>{header}</SectionHeader>
      {children}
    </section>
  )
}
