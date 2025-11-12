import * as regulators from '../../../../db/models/regulators.ts'

import { file } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInRegulatorContext } from '../../../../types.ts'

export const handler = {
  async GET(ctx: LoggedInRegulatorContext) {
    const regulator_id = getRequiredUUIDParam(ctx, 'regulator_id')

    const avatar = await regulators.getAvatar(ctx.state.trx, {
      regulator_id,
    })
    assertOr404(avatar)

    return file(avatar.binary_data, avatar.mime_type)
  },
}

