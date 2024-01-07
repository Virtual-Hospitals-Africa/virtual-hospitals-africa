import { JSX } from 'preact'

export default function ProfileIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      height={props.height || '16'}
      viewBox='0 0 23 16'
      fill='none'
    >
      <path
        d='M14.125 8C16.335 8 18.125 6.21 18.125 4C18.125 1.79 16.335 0 14.125 0C11.915 0 10.125 1.79 10.125 4C10.125 6.21 11.915 8 14.125 8ZM5.125 6V3H3.125V6H0.125V8H3.125V11H5.125V8H8.125V6H5.125ZM14.125 10C11.455 10 6.125 11.34 6.125 14V16H22.125V14C22.125 11.34 16.795 10 14.125 10Z'
        fill='black'
        fill-opacity='0.6'
      />
    </svg>
  )
}
