import { define } from '../define.ts'
import languages from '../../resources/languages/wikipedia-iso-languages.ts'

export default define(
  ['languages'],
  (trx) => trx.insertInto('languages').values(languages).execute(),
  { never_dump: true },
)
