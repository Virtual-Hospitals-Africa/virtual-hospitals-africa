import { ComponentChildren, JSX } from 'preact'

import SectionHeader from './typography/SectionHeader.tsx'

export default function Form(
  { className, header, children, ...props }: JSX.HTMLAttributes<HTMLElement> & {
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
