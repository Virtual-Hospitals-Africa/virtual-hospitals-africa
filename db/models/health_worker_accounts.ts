import { base, identity, simpleBaseQuery } from './_base.ts'

export const health_worker_accounts = base({
  top_level_table: 'health_worker_accounts',
  baseQuery: simpleBaseQuery('health_worker_accounts'),
  formatResult: identity,
})
