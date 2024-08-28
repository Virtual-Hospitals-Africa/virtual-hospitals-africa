import { updateSupervisorsById } from '../../../db/models/pharmacies.ts'
import { LoggedInRegulatorHandlerWithProps } from '../../../types.ts'
import redirect from '../../../util/redirect.ts'

export const handler: LoggedInRegulatorHandlerWithProps = {
    async POST(_req, ctx) {
      const supervisorId = ctx.url.searchParams.get('supervisor')
      const pharmacyId = ctx.url.searchParams.get('pharmacy')
      const id = await updateSupervisorsById(ctx.state.trx,pharmacyId,supervisorId)
      if(id!=null){
        const success = encodeURIComponent(
            'New supervisor added',
        )
        return redirect(
            `/regulator/pharmacies/${id}?success=${success}&show_pharmacy_id=${id}`,
        )
      }else{
        const error = encodeURIComponent(
            'No supervisor found',
        )
        return redirect(
            `/regulator/pharmacies/${pharmacyId}?error=${error}&show_pharmacy_id=${pharmacyId}`,
        )
      }
    },
  }