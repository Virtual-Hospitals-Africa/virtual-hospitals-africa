import { spinner } from '../util/spinner.ts'
import { create } from './create.ts'
import { drop } from './drop.ts'

export async function recreate() {
  await spinner('Recreating database', async () => {
    await drop()
    await create()
  })
}

if (import.meta.main) {
  await recreate()
}
