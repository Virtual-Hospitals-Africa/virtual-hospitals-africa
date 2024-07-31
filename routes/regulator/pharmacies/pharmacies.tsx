import { getAllWithSearchConditions } from '../../../db/models/pharmacies.ts'
import {
  LoggedInRegulatorHandlerWithProps,
  RenderedPharmacy,
} from '../../../types.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import { json } from '../../../util/responses.ts'

type PharmaciesProps = {
  pharmacies: RenderedPharmacy[]
}

export const handler: LoggedInRegulatorHandlerWithProps<PharmaciesProps> = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    const pharmacies = await getAllWithSearchConditions(ctx.state.trx, search)

    const pharmacies_with_href = pharmacies.map((pharmacy) => {
      const href = `/regulator/pharmacists/${pharmacy?.name}`
      return { id: pharmacy?.id, name: pharmacy?.name, href }
    })
    return json(pharmacies_with_href)
  },
}


 
  
