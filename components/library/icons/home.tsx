import { JSX } from 'preact'

export default function HomeIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      height={props.height || '17'}
      viewBox='0 0 21 17'
      fill='none'
    >
      <path
        d='M8.875 17V11H12.875V17H17.875V9H20.875L10.875 0L0.875 9H3.875V17H8.875Z'
        fill='black'
        fill-opacity='0.6'
      />
    </svg>
  )
}
