import { ComponentChildren, JSX } from 'preact'
import cls from '../../util/cls.ts'
import sections from './sections.tsx'

type SectionHeadingProps = {
  icon: JSX.Element
  children: ComponentChildren
  className?: string
} & Omit<JSX.HTMLAttributes<HTMLHeadingElement>, 'icon'>

function SectionHeading(
  { icon, children, className, ...props }: SectionHeadingProps,
) {
  return (
    <h2
      className={cls(
        className,
        'inline-flex items-center rounded-full px-4 py-1 text-blue-600 ring-1 ring-inset ring-blue-600',
      )}
      {...props}
    >
      <span className='font-mono text-sm' aria-hidden='true'>
        {icon}
      </span>
      <span className='ml-3 text-base font-medium tracking-tight'>
        {children}
      </span>
    </h2>
  )
}

export default ({ name }: { name: keyof typeof sections }) => (
  <SectionHeading icon={sections[name].icon}>
    {sections[name].displayName}
  </SectionHeading>
)
