import { define } from '../define.ts'
import range from '../../../util/range.ts'
import { pMap } from '../../../util/inParallel.ts'
import { predefinedAvatarMediaUUID } from '../../../backend/predefinedAvatarMediaUUID.ts'
import { InsertObject } from 'kysely'
import type { DB } from '../../../db.d.ts'

function* avatars() {
  for (const sex of ['female' as const, 'male' as const]) {
    for (const int of range(1, 11)) {
      yield {
        sex,
        int,
        file_name: `./static/images/avatars/random/${sex}/${int}.png`,
      }
    }
  }
}

export default define(['media'], async (trx) => {
  const avatar_images: InsertObject<DB, 'media'>[] = await pMap(
    avatars(),
    async ({ sex, int, file_name }) => {
      return {
        id: predefinedAvatarMediaUUID(sex, int),
        file_name: `avatars/${sex}-${int}.png`,
        mime_type: 'image/png',
        binary_data: await Deno.readFile(file_name),
      }
    },
  )

  return trx.insertInto('media')
    .values(avatar_images)
    .execute()
})
