// import { migrate } from './migrate.ts'
// import { parseArgs } from '@std/cli/parse-args'
// import { codegenOnDev } from './codegenOnDev.ts'

// export async function rebuild(
//   opts: { recreate?: boolean | string[] } = {},
// ) {
//   await migrate.to('_icd10.ts')
//   await migrate.all(opts)
//   await codegenOnDev()
// }

// if (import.meta.main) {
//   const flags = parseArgs(Deno.args)
//   let recreate = flags.r || flags.recreate
//   if (typeof recreate === 'string') {
//     recreate = recreate.split(',')
//   }
//   await rebuild({ recreate })
// }
