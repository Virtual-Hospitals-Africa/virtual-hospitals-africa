export default function AnomalyDetection() {
  return (
    <div
      role='alert'
      class='pointer-events-auto fixed right-6 top-6 z-50 max-w-sm rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-lg'
    >
      <div class='flex items-start gap-3'>
        <svg
          class='mt-0.5 h-5 w-5 flex-none text-amber-600'
          viewBox='0 0 20 20'
          fill='currentColor'
          aria-hidden='true'
        >
          <path
            fill-rule='evenodd'
            d='M8.485 2.495a1.75 1.75 0 0 1 3.03 0l6.28 10.875A1.75 1.75 0 0 1 16.28 16H3.72a1.75 1.75 0 0 1-1.515-2.63l6.28-10.875ZM10 7a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 7Zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'
            clip-rule='evenodd'
          />
        </svg>
        <div class='min-w-0 flex-1'>
          <div class='flex items-center gap-2'>
            <span class='inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900'>
              Anomaly detected
            </span>
          </div>
          <p class='mt-1.5 text-sm font-semibold text-amber-900'>
            Elevated Malaria cases in Mpumalanga
          </p>
          <p class='mt-1 text-xs leading-relaxed text-amber-800'>
            Reported cases of Malaria in Mpumalanga are higher than average for this time of year.
          </p>
        </div>
      </div>
    </div>
  )
}
