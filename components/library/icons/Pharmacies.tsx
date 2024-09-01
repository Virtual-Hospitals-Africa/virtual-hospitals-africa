import { JSX } from 'preact'

export function PharmaciesIcon(props: JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 512 512'
      fill='currentColor'
      className={props.className || 'w-6 h-6'}
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='M486.4,153.6h-128v-128c0-14.14-11.46-25.6-25.6-25.6H179.2c-14.14,0-25.6,11.46-25.6,25.6v128h-128
        C11.46,153.6,0,165.06,0,179.2v153.6c0,14.14,11.46,25.6,25.6,25.6h128v128c0,14.14,11.46,25.6,25.6,25.6h153.6
        c14.14,0,25.6-11.46,25.6-25.6v-128h128c14.14,0,25.6-11.46,25.6-25.6V179.2C512,165.06,500.54,153.6,486.4,153.6z M486.4,332.8
        H332.8v153.6H179.2V332.8H25.6V179.2h153.6V25.6h153.6v153.6h153.6V332.8z' />
    </svg>
  )
}
