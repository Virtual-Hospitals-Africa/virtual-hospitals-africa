import { JSX } from 'preact'

export function Logo(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      viewBox='0 0 138 115'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M17.22 57.3456C25.6056 50.8134 41.9837 39.4679 68.3197 39.468C100.556 39.4681 112.606 51.0426 121.778 57.3456M7 39.468C14.5708 34.2652 25.4745 25.716 47.0936 23.2464M131.406 39.468C123.836 34.2652 112.932 25.716 91.3127 23.2464M7 17.4019C10.5377 13.964 21.3903 8.11935 29.4052 6.74415M131.406 17.4019C127.869 13.9639 117.016 8.11934 109.001 6.74414'
        stroke='white'
        stroke-width='12.3768'
        stroke-linecap='round'
      />
      <path
        d='M29.7979 75.8234C36.1659 70.8629 48.6034 62.2471 68.6029 62.2472C93.0827 62.2473 102.234 71.0369 109.199 75.8234'
        stroke='white'
        stroke-width='12.3768'
        stroke-linecap='round'
      />
      <path
        d='M47.0938 92.7188C50.6876 89.9193 57.7068 85.057 68.9936 85.057C82.809 85.057 87.9735 90.0176 91.9042 92.7188'
        stroke='white'
        stroke-width='12.3768'
        stroke-linecap='round'
      />
      <ellipse
        cx='70.2848'
        cy='108.572'
        rx='6.68227'
        ry='5.8446'
        fill='white'
      />
    </svg>
  )
}
