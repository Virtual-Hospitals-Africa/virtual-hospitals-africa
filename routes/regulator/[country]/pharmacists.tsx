import PharmacistsTable from '../../../components/regulator/PharmacistsTable.tsx'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulator } from '../../../types.ts'
import Form from '../../../components/library/Form.tsx'
import FormRow from '../../../components/library/FormRow.tsx'
import { Button } from '../../../components/library/Button.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import { TextInput } from '../../../islands/form/Inputs.tsx'
import { json } from '../../../util/responses.ts'
import { RegulatorHomePageLayout } from '../../regulator/_middleware.tsx'

export default RegulatorHomePageLayout(
  'Pharmacists',
  async function PharmacistsPage(
    req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const page = searchPage(ctx)
    const search = ctx.url.searchParams.get('search')
    const search_terms = pharmacists.toSearchTerms(search)
    const search_results = await pharmacists.search(
      ctx.state.trx,
      search_terms,
      { page },
    )

    if (req.headers.get('accept') === 'application/json') {
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
            className='w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
          >
            Invite
          </Button>
        </FormRow>
        <PharmacistsTable {...search_results} />
      </Form>
    )
  },
)
