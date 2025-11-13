import { Media } from '../../../db.d.ts'
import { InsertShape } from '../../../types.ts'
import { define } from '../define.ts'
import range from '../../../util/range.ts'
import { pMap } from '../../../util/inParallel.ts'
import { padLeft } from '../../../util/pad.ts'

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

export function predefinedAvatarMediaUUID(sex: 'male' | 'female', int: number) {
  return `050f4d63-3cda-4571-a226-29a173eff${sex === 'male' ? '0' : '1'}${
    padLeft(String(int), 2, '0')
  }`
}

export default define(['media'], async (trx) => {
  const avatar_images: InsertShape<Media>[] = await pMap(
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
