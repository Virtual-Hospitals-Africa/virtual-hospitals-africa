import { JSX } from 'preact/jsx-runtime'

export default function ArrowLeftIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      height={props.height || '16'}
      viewBox='0 0 16 16'
      fill='white'
    >
      <path d='M16 7H3.83L9.42 1.41L8 0L0 8L8 16L9.41 14.59L3.83 9H16V7Z' />
    </svg>
  )
}
