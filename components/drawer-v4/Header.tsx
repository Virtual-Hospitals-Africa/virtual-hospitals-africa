import { ComponentChildren } from 'preact'

export function Header({ children }: { children: ComponentChildren }) {
  return (
    <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-5.5 not-italic relative shrink-0 text-[#29313d] text-4 text-nowrap whitespace-pre z-2 pb-1">
      {children}
    </h2>
  )
}
