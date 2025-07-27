import Layout from '../../../components/library/Layout.tsx'
import { PharmaciesTable } from '../../../components/regulator/PharmaciesTable.tsx'
import { LoggedInRegulator } from '../../../types.ts'
import * as pharmacies from '../../../db/models/pharmacies.ts'
import { FreshContext } from '$fresh/server.ts'
import FormRow from '../../../components/library/FormRow.tsx'
import { Button } from '../../../components/library/Button.tsx'
import Form from '../../../components/library/Form.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import { TextInput } from '../../../islands/form/Inputs.tsx'
import { json } from '../../../util/responses.ts'

export default async function PharmaciesPage(
  req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const page = searchPage(ctx)
  const search = ctx.url.searchParams.get('search')

  const search_terms = pharmacies.toSearchTerms(search)

  const search_results = await pharmacies.search(
    ctx.state.trx,
    search_terms,
    { page },
  )

  if (req.headers.get('accept') === 'application/json') {
    return json(search_results)
  }

  return (
    <Layout
      title='Pharmacies'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={ctx.params}
      variant='regulator home page'
    >
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
            Search
          </Button>
        </FormRow>
        <PharmaciesTable {...search_results} />
      </Form>
    </Layout>
  )
}
