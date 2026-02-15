import HealthWorkersTable from '../../components/regulator/HealthWorkersTable.tsx'
import { interpretLicenceSearchAsSuch } from '../../db/models/health_workers.ts'
import { Context } from 'fresh'
import { LoggedInRegulator } from '../../types.ts'
import Form from '../../components/library/Form.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import { Button } from '../../components/library/Button.tsx'
import { searchPage } from '../../util/searchPage.ts'

import { json } from '../../util/responses.ts'
import { RegulatorHomePageLayout } from './_middleware.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { SERVER_COUNTRY } from '../../db/models/countries.ts'
import { regulator_health_workers } from '../../db/models/regulator_health_workers.ts'

export default RegulatorHomePageLayout(
  'HealthWorkers',
  async function HealthWorkersPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const page = searchPage(ctx)
    const search = ctx.url.searchParams.get('search')
    const search_results = await regulator_health_workers.search(
      ctx.state.trx,
      interpretLicenceSearchAsSuch({ search, country: SERVER_COUNTRY, licence_status: 'all' }),
      { page },
    )

    if (ctx.req.headers.get('accept') === 'application/json') {
      return json(search_results)
    }

    return (
      <Form>
        <FormRow className='mb-4'>
          <TextInput
            name='search'
            label=''
            placeholder='Search by name or licence number'
            value={search ?? ''}
          />
          <Button
            type='submit'
            className='grid self-end p-2 text-white border-0 rounded-md shadow-sm w-max ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 whitespace-nowrap place-items-center'
          >
            Invite
          </Button>
        </FormRow>
        <HealthWorkersTable {...search_results} country={SERVER_COUNTRY} />
      </Form>
    )
  },
)
