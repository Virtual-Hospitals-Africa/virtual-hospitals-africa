import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'
import sortBy from '../../util/sortBy.ts'
import { spinner } from '../../util/spinner.ts'
import createSeed from '../createSeed.ts'

const SEED_DUMPS_DIRECTORY = './db/seed/dumps'

export const seeds: Record<
  string,
  {
    table_names: string[]
    never_dump: boolean
    load: () => Promise<void>
    dump: () => Promise<void>
    drop: () => Promise<void>
    reload: () => Promise<void>
    recreate: () => Promise<void>
    clear_dump: () => Promise<void>
  }
> = {}
for (const seed_file of Deno.readDirSync('./db/seed/defs')) {
  if (!seed_file.isFile) continue
  const seed_name = seed_file.name
  const seed = await import(`./defs/${seed_name}`)
  seeds[seed_name] = seed.default || seed
}

type Cmd = 'load' | 'dump' | 'drop' | 'recreate' | 'reload' | 'clear_dump'

export const seed_targets = sortBy(Object.keys(seeds), (key) => {
  const numeric = parseInt(key.split('_')[0])
  if (isNaN(numeric)) {
    throw new Error('Seed file names must start with a number. Got: ' + key)
  }
  return numeric
})

type TargetFindResult =
  | { type: 'found'; name: string; seed: typeof seeds[string] }
  | { type: 'not_found' }
  | { type: 'ambiguous'; matching: string[] }

function findTarget(target: string): TargetFindResult {
  const target_file = last(target.split('/'))
  assert(target_file)
  const matching = seed_targets.filter((it) => it.includes(target_file))
  switch (matching.length) {
    case 1:
      return {
        type: 'found',
        name: matching[0],
        seed: seeds[matching[0]],
      }
    case 0:
      return { type: 'not_found' }
    default:
      return { type: 'ambiguous', matching }
  }
}

const gerund = {
  load: 'loading',
  dump: 'dumping',
  drop: 'dropping',
  recreate: 'recreating',
  reload: 'reloading',
  create: 'creating',
  clear_dump: 'clearing dump',
}

const past_tense = {
  load: 'loaded',
  dump: 'dumped',
  drop: 'dropped',
  recreate: 'recreated',
  reload: 'reloaded',
  create: 'created',
  clear_dump: 'dump cleared',
}

export async function load(target?: string) {
  await run('load', target)
}

export async function dump(target?: string) {
  await run('dump', target)
}

export async function drop(target?: string) {
  await run('drop', target)
}

export async function recreate(target?: string) {
  await run('recreate', target)
}

export async function reload(target?: string) {
  await run('reload', target)
}

export async function clear_dump(target: string) {
  assert(target, 'clear_dump requires a target')
  await run('clear_dump', target)
}

export async function dumpAll() {
  for (const seed_name of seed_targets) {
    const seed = seeds[seed_name]
    if (seed.never_dump) continue

    const existing_dumps = new Set(
      Array.from(Deno.readDirSync(SEED_DUMPS_DIRECTORY)).map((f) => f.name),
    )
    const missing = seed.table_names.filter(
      (tn) => !existing_dumps.has(`${tn}.tsv`),
    )
    if (!missing.length) continue

    await spinner(`dumping seed ${seed_name}`, async () => {
      await seed.dump()
      return `${seed_name} dumped. Tables affected: ${seed.table_names.join(', ')}. Previously missing: ${missing.join(', ')}.`
    })
  }
}

export async function loadRecreating(targets: string[]) {
  const to_recreate = targets.map((target) => {
    const result = findTarget(target)
    if (result.type === 'not_found') {
      console.error(
        `No seed found matching ${target}. Valid targets:\n${
          seed_targets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    if (result.type === 'ambiguous') {
      console.error(
        `Multiple seeds found matching ${target}. Please be more specific. Valid targets:\n${
          seed_targets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    return result.name
  })

  for (const seed_name of seed_targets) {
    const cmd = to_recreate.includes(seed_name) ? 'recreate' : 'load'
    await run(cmd, seed_name)
  }
}

export async function run(cmd: Cmd, target?: string) {
  let targets = seed_targets
  if (target) {
    const result = findTarget(target)
    if (result.type === 'not_found') {
      console.error(
        `Please specify a valid target as in\n\n  deno task db:seed ${cmd} ${seed_targets[0]}\n\nValid targets:\n${seed_targets.join('\n')}`,
      )
      Deno.exit(1)
    }
    if (result.type === 'ambiguous') {
      console.error(
        `Multiple seeds found matching ${target}. Please be more specific. Valid targets:\n${
          seed_targets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    targets = [result.name]
  }

  for (const seed_name of targets) {
    await spinner(`${gerund[cmd]} seed ${seed_name}`, async () => {
      const seed = seeds[seed_name]
      const result = await seed[cmd]() as string | void
      return `${seed_name} ${result || past_tense[cmd]}. Tables affected: ${seed.table_names.join(', ')}.`
    })
  }
}

function isRecognizedCommand(cmd: string): cmd is keyof typeof gerund {
  return !!cmd && cmd in gerund
}

function main() {
  const [cmd, target] = Deno.args
  if (cmd === 'dump:all') {
    return dumpAll()
  }
  if (!isRecognizedCommand(cmd)) {
    console.error(
      'Please provide a valid command name as in\ndeno task db:seed $cmd\nAvailable commands:',
    )
    Object.keys(gerund).forEach((it) => console.error(`  ${it}`))
    Deno.exit(1)
  }
  if (cmd === 'create') {
    return createSeed(target)
  }
  run(cmd, target)
}

if (import.meta.main) {
  main()
}
