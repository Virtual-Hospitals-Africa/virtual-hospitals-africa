import { JSX } from 'preact'

export default function CalendarIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      height={props.height || '22'}
      viewBox='0 0 21 22'
      fill='none'
    >
      <path
        fill='black'
        fill-opacity='0.6'
        d='M18.625 2H17.625V0H15.625V2H5.625V0H3.625V2H2.625C1.525 2 0.625 2.9 0.625 4V20C0.625 21.1 1.525 22 2.625 22H18.625C19.725 22 20.625 21.1 20.625 20V4C20.625 2.9 19.725 2 18.625 2ZM18.625 20H2.625V7H18.625V20Z'
      />
    </svg>
  )
}
