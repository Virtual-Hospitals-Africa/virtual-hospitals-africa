import { OrganizationsTable } from '../../../components/regulator/OrganizationsTable.tsx'
import { LoggedInRegulator } from '../../../types.ts'
import * as organizations from '../../../db/models/organizations.ts'
import { FreshContext } from '$fresh/server.ts'
import FormRow from '../../../components/library/FormRow.tsx'
import { Button } from '../../../components/library/Button.tsx'
import Form from '../../../components/library/Form.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import { TextInput } from '../../../islands/form/Inputs.tsx'
import { json } from '../../../util/responses.ts'
import { RegulatorHomePageLayout } from '../_middleware.tsx'

export default RegulatorHomePageLayout(
  'Organizations',
  async function OrganizationsPage(
    req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const { country } = ctx.params
    const page = searchPage(ctx)
    const search = ctx.url.searchParams.get('search')

    const search_terms = organizations.toSearchTerms(country, search)

    const search_results = await organizations.search(
      ctx.state.trx,
      search_terms,
      { page },
    )

    if (req.headers.get('accept') === 'application/json') {
      return json(search_results)
    }

    return (
      <Form>
        <FormRow className='mb-4 flex gap-2'>
          <TextInput
            name='search'
            label=''
            placeholder='Search by organization name'
            value={search ?? ''}
            className='flex-1'
          />
          <Button
            type='submit'
            className='w-max rounded-md border-0 bg-indigo-600 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 px-4 self-end whitespace-nowrap grid place-items-center'
          >
            Search
          </Button>
          <Button
            href={`/regulator/${country}/organizations/add`}
            className='w-max rounded-md border-0 bg-green-600 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 h-9 px-4 self-end whitespace-nowrap grid place-items-center'
          >
            Add Organization
          </Button>
        </FormRow>
        <OrganizationsTable country={country} {...search_results} />
      </Form>
    )
  },
)
