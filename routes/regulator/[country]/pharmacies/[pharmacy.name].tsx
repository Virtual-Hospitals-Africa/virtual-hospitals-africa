import { LoggedInRegulatorContext } from '../../../../types.ts'
import { RegulatorHomePageLayout } from '../../../regulator/_middleware.tsx'

export default RegulatorHomePageLayout(
  'Pharmacy Profile',
  function PharmacyPage(
    _req: Request,
    ctx: LoggedInRegulatorContext,
  ) {
    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
      </div>
    )
  },
)
