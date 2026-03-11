
export function NoTasks() {
  return (
    <div class='flex flex-col gap-4 items-center justify-center py-12 text-gray-500'>
      <svg
        class='w-16 h-16 text-gray-300'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='1.5'
          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <p class='text-lg font-medium'>No additional tasks required</p>
      <p class='text-sm'>
        Based on the patient's current clinical findings, no additional tasks are needed.
      </p>
    </div>
  )
}
