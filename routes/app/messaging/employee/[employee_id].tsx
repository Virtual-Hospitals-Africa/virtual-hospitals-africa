import { employees } from '../../../../db/models/employees.ts'
import { PageBackButton } from '../../../../islands/PageBackButton.tsx'
import { HealthWorkerHomePage } from '../../_middleware.tsx'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'

export default HealthWorkerHomePage(
  'Message',
  async function EmployeeMessagingPage(ctx: LoggedInHealthWorkerContext) {
    const employee_id = getRequiredUUIDParam(ctx, 'employee_id')
    assertOr404(
      await employees.getByIdOptional(ctx.state.trx, employee_id),
      'Employee not found',
    )

    return (
      <div className='mt-4 flex flex-col gap-4'>
        <PageBackButton id='employee-messaging-back' />
        <section id='employee-messaging-placeholder' className='rounded-lg bg-white p-6'>
          <h1 className='text-lg font-semibold leading-6 text-gray-800'>Coming soon</h1>
          <p className='mt-2 text-sm leading-5 text-gray-600'>
            TODO: employee messaging is not available yet.
          </p>
        </section>
      </div>
    )
  },
)
