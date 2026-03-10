import { Context } from 'fresh'
import { HealthWorkerHomePageLayout } from '../../components/library/layout/HealthWorkerHomePage.tsx'
import { TUTORIAL_EMPLOYEE } from '../../shared/tutorial/mock-data.ts'
import { requestAsRecord } from '../../backend/parseForm.ts'

type ParsedPatientCase = {
  sex?: string
  dob?: string
  height_cm?: string | number
  weight_kg?: string | number
  conditions?: Record<string, string>
}

export default async function RecommendedMedications(
  ctx: Context<unknown>,
) {
  const record = await requestAsRecord(ctx.req) as ParsedPatientCase

  const conditions = record.conditions ? Object.values(record.conditions as Record<string, string>) : []

  return (
    <HealthWorkerHomePageLayout
      title='Recommended Medications'
      url={ctx.url}
      route={ctx.route!}
      params={{}}
      employee={TUTORIAL_EMPLOYEE}
      tutorial
    >
      <div className='flex flex-col gap-6 py-6'>
        <section className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold text-gray-900'>Patient Details</h2>
          <dl className='flex flex-col gap-1'>
            <div className='flex gap-4'>
              <dt className='w-32 text-sm font-medium text-gray-500'>Date of Birth</dt>
              <dd className='text-sm text-gray-900'>{record.dob ?? '—'}</dd>
            </div>
            <div className='flex gap-4'>
              <dt className='w-32 text-sm font-medium text-gray-500'>Sex</dt>
              <dd className='text-sm text-gray-900'>{record.sex ?? '—'}</dd>
            </div>
            <div className='flex gap-4'>
              <dt className='w-32 text-sm font-medium text-gray-500'>Height (cm)</dt>
              <dd className='text-sm text-gray-900'>{record.height_cm ?? '—'}</dd>
            </div>
            <div className='flex gap-4'>
              <dt className='w-32 text-sm font-medium text-gray-500'>Weight (kg)</dt>
              <dd className='text-sm text-gray-900'>{record.weight_kg ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold text-gray-900'>Conditions</h2>
          {conditions.length > 0
            ? (
              <ul className='flex flex-col gap-1 list-disc list-inside'>
                {conditions.map((code, i) => <li key={i} className='text-sm text-gray-900'>{code}</li>)}
              </ul>
            )
            : <p className='text-sm text-gray-500'>No conditions specified.</p>}
        </section>

        <section className='flex flex-col gap-2'>
          <h2 className='text-lg font-semibold text-gray-900'>Recommended Medications</h2>
          <p className='text-sm text-gray-500'>
            Recommended dose calculation logic will be added here.
          </p>
        </section>
      </div>
    </HealthWorkerHomePageLayout>
  )
}
