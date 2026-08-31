import { Fragment } from 'preact'
import { PageProps } from 'fresh'
import AnomalyDetection from '../components/dashboard/AnomalyDetection.tsx'
import FilterBar from '../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../components/dashboard/filters/DateRangeInput.tsx'
import { parseDateRange } from '../util/dashboard/filters.ts'
import type { CountryFilters } from '../util/dashboard/country.ts'
import { COUNTRY_DASHBOARD_WIDGETS } from '../components/dashboard/widgets/country/index.ts'

function spanClass(span: number | undefined): string {
  switch (span ?? 4) {
    case 12:
      return 'col-span-12'
    case 6:
      return 'col-span-12 lg:col-span-6'
    case 8:
      return 'col-span-12 lg:col-span-8'
    case 3:
      return 'col-span-12 sm:col-span-6 lg:col-span-3'
    default:
      return 'col-span-12 sm:col-span-6 lg:col-span-4'
  }
}

export default function DashboardCountry({ url }: PageProps) {
  const date_range = parseDateRange(url)
  const filters: CountryFilters = { date_range }

  const items = COUNTRY_DASHBOARD_WIDGETS.map((widget) => ({
    id: widget.id,
    span: widget.span,
    element: widget.render(widget.fetch(filters)),
  }))

  return (
    <div class='min-h-screen bg-gray-50'>
      <AnomalyDetection />
      <header class='border-b border-gray-200 bg-white'>
        <div class='mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 px-6 py-5'>
          <div>
            <div class='flex items-center gap-2'>
              <span class='inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-red-700'>
                Preview
              </span>
              <span class='text-xs text-gray-500'>South Africa · Notifiable Medical Conditions</span>
            </div>
            <h1 class='mt-1 text-2xl font-semibold tracking-tight text-gray-900'>Country-wide surveillance</h1>
          </div>
          <p class='max-w-md text-xs text-gray-500'>
            Synthetic fixtures for layout review. Regenerate with{' '}
            <code class='rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-700'>
              deno run -A scripts/generate_dashboard_fixtures.ts
            </code>.
          </p>
        </div>
      </header>
      <div class='mx-auto max-w-7xl px-6 py-6'>
        <FilterBar action={url.pathname}>
          <DateRangeInput value={date_range} />
        </FilterBar>
        <div class='mt-6 grid grid-cols-12 gap-5'>
          {items.map(({ id, span, element }) => (
            <div key={id} class={spanClass(span)}>
              <Fragment>{element}</Fragment>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
