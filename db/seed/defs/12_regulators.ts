import { TrxOrDb } from '../../../types.ts'
import { create } from '../create.ts'

const regulators = [
  { name: 'Will Weiss', email: 'william.t.weiss@gmail.com' },
  { name: 'Zora Chen', email: 'zorachen84613@gmail.com' },
  { name: 'Mike Huang', email: 'mike.huang.mikank@gmail.com' },
  { name: 'Ming Liu', email: '812046661lm@gmail.com' },
  { name: 'Sikhululiwe Ngwenya', email: 'ngwenyasikhululiwe125@gmail.com' },
  { name: 'Jonathan Tagarisa', email: 'jonathantagarisa@gmail.com' },
  { name: 'Saad Malik', email: 'saadmparacha@gmail.com' },
  { name: 'Laurence Lo', email: 'laurence.regu@gmail.com' },
  { name: 'Mingda Ma', email: 'whoapple8@gmail.com' },
  { name: 'Rishab Sanyal', email: 'rsanyal@ucdavis.edu' },
]

export default create(['regulators'], addRegulators)

// Add a test organization with all VHA employees as admins
async function addRegulators(trx: TrxOrDb) {
  await trx
    .insertInto('regulators')
    .values(regulators)
    .execute()
}
