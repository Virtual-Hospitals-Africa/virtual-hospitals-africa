import db from './db.ts'
import selectAllNonMetaTables from './selectAllNonMetaTables.ts'

export default async function reset() {
  const tables = await selectAllNonMetaTables(db)
  for (const table of tables) {
    if (table === 'facilities') {
      continue
    }
    //console.log(`Deleting all rows from ${table}`)
    // deno-lint-ignore no-explicit-any
    await db.deleteFrom(table as any).execute()
  }
}
