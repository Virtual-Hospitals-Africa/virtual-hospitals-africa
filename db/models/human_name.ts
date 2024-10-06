import { sql } from 'kysely/index.js'

export const name_string_sql = (table_name = 'HumanName') =>
  sql<string>`${sql.raw(table_name)}.given || ' ' || ${
    sql.raw(table_name)
  }.family`
