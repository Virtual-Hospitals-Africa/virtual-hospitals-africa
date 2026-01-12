import { WIKIPEDIA_ISO_LANGUAGES } from '../../../shared/wikipedia-iso-languages.ts'
import { define } from '../define.ts'

export default define(
  ['languages'],
  (trx) => trx.insertInto('languages').values(WIKIPEDIA_ISO_LANGUAGES).execute(),
  { never_dump: true },
)
