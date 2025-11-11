import {
  LoggedInHealthWorkerContext,
  RenderedMessageTarget,
} from '../../../types.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import isKeyOf from '../../../util/isKeyOf.ts'
import { MESSAGE_TARGET_CATEGORIES, MessageTargetCategory } from '../../../shared/message_targets.ts'
import * as message_targets from '../../../db/models/message_targets.ts'

export const handler = jsonSearchHandler<
  { message_target_category: MessageTargetCategory; search: string },
  RenderedMessageTarget,
  // deno-lint-ignore no-explicit-any
  LoggedInHealthWorkerContext<any>
>({
  async search(trx, { message_target_category, search }) {
    assertOr400(isKeyOf(message_target_category, MESSAGE_TARGET_CATEGORIES))
    
    const results = await message_targets.searchTargetCategory(trx, message_target_category, { search})

    return {
      results,
      page: 1,
      rows_per_page: 20,
      has_next_page: false,
      search_terms: { message_target_category, search }
    }
  },
})
