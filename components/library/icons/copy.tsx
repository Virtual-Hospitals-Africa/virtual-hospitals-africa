import { JSX } from 'preact/jsx-runtime'

export default function CopyIcon(
  props: JSX.SVGAttributes<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      height={props.height || '13'}
      viewBox='0 0 13 13'
      fill='none'
    >
      <path
        d='M9.78419 0.990234H2.22977C1.53728 0.990234 0.970703 1.47955 0.970703 2.07761V9.68926H2.22977V2.07761H9.78419V0.990234ZM11.6728 3.16499H4.74791C4.05542 3.16499 3.48884 3.65431 3.48884 4.25237V11.864C3.48884 12.4621 4.05542 12.9514 4.74791 12.9514H11.6728C12.3653 12.9514 12.9319 12.4621 12.9319 11.864V4.25237C12.9319 3.65431 12.3653 3.16499 11.6728 3.16499ZM11.6728 11.864H4.74791V4.25237H11.6728V11.864Z'
        fill='black'
        fill-opacity='0.54'
      />
    </svg>
  )
}
