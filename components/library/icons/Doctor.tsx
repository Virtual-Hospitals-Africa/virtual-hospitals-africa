// A stethoscope, so the doctor role reads distinctly from the nurse cap.
export function DoctorIcon(
  { className }: { className?: string },
) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='#4F46E5'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path d='M11 2v2' />
      <path d='M5 2v2' />
      <path d='M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1' />
      <path d='M8 15a6 6 0 0 0 12 0v-3' />
      <circle cx='20' cy='10' r='2' />
    </svg>
  )
}
