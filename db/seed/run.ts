import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'
import sortBy from '../../util/sortBy.ts'

export const seeds: Record<
  string,
  {
    table_names: string[]
    load: () => Promise<Deno.CommandOutput>
    dump: () => Promise<Deno.CommandOutput>
    drop: () => Promise<Deno.CommandOutput>
    recreate: () => Promise<Deno.CommandOutput>
  }
> = {}
for (const seedFile of Deno.readDirSync('./db/seed/defs')) {
  const seedName = seedFile.name
  const seed = await import(`./defs/${seedName}`)
  seeds[seedName] = seed.default || seed
}

type Cmd = 'load' | 'dump' | 'drop' | 'recreate'

export const seedTargets = sortBy(Object.keys(seeds), (key) => {
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
  const matching = seedTargets.filter((it) => it.includes(target_file))
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
}

const past_tense = {
  load: 'loaded',
  dump: 'dumped',
  drop: 'dropped',
  recreate: 'recreated',
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

export async function loadRecreating(targets: string[]) {
  const to_recreate = targets.map((target) => {
    const result = findTarget(target)
    if (result.type === 'not_found') {
      console.error(
        `No seed found matching ${target}. Valid targets:\n${
          seedTargets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    if (result.type === 'ambiguous') {
      console.error(
        `Multiple seeds found matching ${target}. Please be more specific. Valid targets:\n${
          seedTargets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    return result.name
  })

  for (const seedName of seedTargets) {
    const cmd = to_recreate.includes(seedName) ? 'recreate' : 'load'
    await run(cmd, seedName)
  }
}

export async function run(cmd: Cmd, target?: string) {
  let targets = seedTargets
  if (target) {
    const result = findTarget(target)
    if (result.type === 'not_found') {
      console.error(
        `Please specify a valid target as in\n\n  deno task db:seeds:${cmd} ${
          seedTargets[0]
        }\n\nValid targets:\n${seedTargets.join('\n')}`,
      )
      Deno.exit(1)
    }
    if (result.type === 'ambiguous') {
      console.error(
        `Multiple seeds found matching ${target}. Please be more specific. Valid targets:\n${
          seedTargets.join(
            '\n',
          )
        }`,
      )
      Deno.exit(1)
    }
    targets = [result.name]
  }

  for (const seedName of targets) {
    console.log(`${gerund[cmd]} seed ${seedName}...`)
    const seed = seeds[seedName]
    await seed[cmd]()
    console.log(
      `${seedName} ${past_tense[cmd]}. Tables affected: ${
        seed.table_names.join(', ')
      }.`,
    )
  }
}

function isRecognizedCommand(cmd: string): cmd is keyof typeof gerund {
  return !!cmd && cmd in gerund
}

if (import.meta.main) {
  const [cmd, target] = Deno.args
  if (!isRecognizedCommand(cmd)) {
    console.error(
      'Please provide a valid command name as in\ndeno task db:seed $cmd\nAvailable commands:',
    )
    Object.keys(gerund).forEach((it) => console.error(`  ${it}`))
    Deno.exit(1)
  }

  run(cmd, target)
}
