import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { Select } from 'prompt'
import { seed_targets } from './seed/run.ts'
import { padLeft } from '../util/pad.ts'
import { getTables } from './getTables.ts'
import last from '../util/last.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
const seed_defs_dir = `db/seed/defs`

const seed_integer_prefix_length = 2

function assertIsInteger(int: number) {
  assertEquals(int, Math.floor(int), `${int} is not an integer`)
}

function asPrefix(int: number) {
  assertIsInteger(int)
  return padLeft(String(int), seed_integer_prefix_length, '0')
}

function orderOf(file: string) {
  assert(file.endsWith('.ts'))
  const numeric = file.slice(0, seed_integer_prefix_length)
  const int = parseInt(numeric)
  assertIsInteger(int)
  return int
}

function fileName(order: number, seed_name: string) {
  assertIsInteger(order)
  return `${asPrefix(order)}_${seed_name}.ts`
}

function* remapSeedFiles(placement: string) {
  const index = seed_targets.findIndex((target) => target === placement)
  assertNotEquals(index, -1, `Could not find ${placement} in seed_targets`)
  const needs_shifting = seed_targets.slice(index)
  for (const file of needs_shifting) {
    const next_order = 1 + orderOf(file)
    const next_prefix = asPrefix(next_order)
    const map_to = next_prefix + file.slice(seed_integer_prefix_length)
    yield { file, map_to }
  }
}

function initialSeedFileContents(table_name: string) {
  return `import z from 'zod'
import { DB } from '../../../db.d.ts'
import { InsertShape } from '../../../types.ts'
import { define } from '../define.ts'
import { collectTsvResource } from '../../parseTsvResource.ts'

export const ${table_name}: InsertObject<DB, '${table_name}'>[] = await collectTsvResource(
  '${table_name}',
  z.object({

  }),
)

export default define(['${table_name}'], (trx) =>
  trx.insertInto('${table_name}')
    .values(${table_name})
    .execute())
`
}

export default async function createSeed(seed_name?: string) {
  const table_name = await Select.prompt({
    message: 'Which database table does the seed populate?',
    options: getTables(),
    search: true,
  })

  if (!seed_name) {
    seed_name = table_name
  }

  const next_order = 1 + orderOf(last(seed_targets)!)
  const new_option = fileName(next_order, seed_name)

  const placement = await Select.prompt({
    message: 'Where to place the seed file? The file will immediately precede whichever file you select if not placed at the end',
    options: seed_targets.concat([new_option]),
    default: new_option,
  })

  const file_name = placement === new_option ? placement : fileName(orderOf(placement), seed_name)

  const file_path = `${seed_defs_dir}/${file_name}`

  await Deno.writeTextFile(file_path, initialSeedFileContents(table_name))

  console.log('Created seed file: ', file_path)

  if (placement !== new_option) {
    for (const { file, map_to } of remapSeedFiles(placement)) {
      await Deno.rename(
        `${seed_defs_dir}/${file}`,
        `${seed_defs_dir}/${map_to}`,
      )
      console.log(`Renamed ${file} to ${map_to}`)
    }
  }
}
