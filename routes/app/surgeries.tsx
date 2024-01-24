import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as conditions from '../../db/models/conditions.ts'
import { json } from '../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    if (!search) return json([])

    return json(await conditions.searchSurgery(ctx.state.trx, { search }))

    // try {
    //   const response = await fetch(
    //     `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${
    //       encodeURIComponent(search)
    //     }&df=key_id,primary_name`,
    //   )
    //   const data = await response.json()
    //   // deno-lint-ignore no-explicit-any
    //   const conditions = data[3].map(([key_id, name]: any) => ({
    //     // We need to prefix the key_id with c_ to avoid these keys being parsed as numbers
    //     id: `c_${key_id}`,
    //     name,
    //   }))

    //   return json(conditions)
    // } catch (err) {
    //   return json(await conditions.search(ctx.state.trx, { search }))
    // }
  },
}
