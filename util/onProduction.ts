import { opts as db_opts } from '../db/db.ts'

export function onProduction() {
  return !!db_opts && db_opts.host !== 'localhost'
}
