import { JSX } from 'preact'

function HeroIconOutline(
  { className = 'w-6 h-6', withCircle = false, children, ...props }: JSX.SVGAttributes<
    SVGSVGElement
  > & { withCircle?: boolean },
): JSX.Element {
  return (
    <svg
      fill='none'
      viewBox='0 0 30 30'
      strokeWidth={1.5}
      stroke='currentColor'
      className={className}
      {...props}
    >
      {withCircle && <circle cx="15" cy="15" r="14" stroke="currentColor" />}
      <g transform="translate(3, 3)">
        {children}
      </g>
    </svg>
  )
}


export function ClipboardDocumentCheckIcon(
  { withCircle = false, ...props }: JSX.SVGAttributes<SVGSVGElement> & { withCircle?: boolean },
) {
  return (
    <HeroIconOutline withCircle={withCircle} {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75'
      >
      </path>
    </HeroIconOutline>
  )
}

export function CalendarDaysIcon(
  { withCircle = false, ...props }: JSX.SVGAttributes<SVGSVGElement> & { withCircle?: boolean },
) {
  return (
    <HeroIconOutline withCircle={withCircle} {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z'
      >
      </path>
    </HeroIconOutline>
  )
}

export function ShieldExclamationIcon(
  { withCircle = false, ...props }: JSX.SVGAttributes<SVGSVGElement> & { withCircle?: boolean },
) {
  return (
    <HeroIconOutline withCircle={withCircle} {...props}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z'
      >
      </path>
    </HeroIconOutline>
  )
}