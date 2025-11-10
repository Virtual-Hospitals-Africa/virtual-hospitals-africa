// import { assert } from 'std/assert/assert.ts'
// import { MessageTargetType } from '../../../db.d.ts'
// import {
//   LoggedInHealthWorkerContext,
//   RenderedMessageTarget,
// } from '../../../types.ts'
// import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'
// import arraysEqual from '../../../util/arraysEqual.ts'
// import { assertOr400 } from '../../../util/assertOr.ts'

// type SearchType =
//   | 'profession_and_employment'
//   | 'organization'
//   | 'region'

// function getSearchType(target_types: MessageTargetType[]): SearchType {
//   if (arraysEqual(target_types, ['profession', 'employment'])) {
//     return 'profession_and_employment'
//   }
//   if (arraysEqual(target_types, ['organization'])) return 'organization'
//   if (arraysEqual(target_types, ['region'])) return 'region'
//   throw new Error(`Unsupported search ${target_types}`)
// }

// export const handler = jsonSearchHandler<
//   { target_types: MessageTargetType[]; search: string },
//   RenderedMessageTarget,
//   // deno-lint-ignore no-explicit-any
//   LoggedInHealthWorkerContext<any>
// >({
//   async search(trx, { target_types, search }) {
//     const search_type = getSearchType(target_types)
//   },
// })
