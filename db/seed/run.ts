import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'
import sortBy from '../../util/sortBy.ts'
import { spinner } from '../../util/spinner.ts'

export const seeds: Record<
  string,
  {
    table_names: string[]
    load: () => Promise<undefined | string>
    dump: () => Promise<undefined | string>
    drop: () => Promise<undefined | string>
    reload: () => Promise<undefined | string>
    recreate: () => Promise<undefined | string>
  }
> = {}
for (const seedFile of Deno.readDirSync('./db/seed/defs')) {
  const seedName = seedFile.name
  const seed = await import(`./defs/${seedName}`)
  seeds[seedName] = seed.default || seed
}

type Cmd = 'load' | 'dump' | 'drop' | 'recreate' | 'reload'

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
  reload: 'reloading',
}

const past_tense = {
  load: 'loaded',
  dump: 'dumped',
  drop: 'dropped',
  recreate: 'recreated',
  reload: 'reloaded',
}

export function load(target?: string) {
  return run('load', target)
}

export function dump(target?: string) {
  return run('dump', target)
}

export function drop(target?: string) {
  return run('drop', target)
}

export function recreate(target?: string) {
  return run('recreate', target)
}

export function reload(target?: string) {
  return run('reload', target)
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
        `Please specify a valid target as in\n\n  deno task db:seed ${cmd} ${
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
    const seed = seeds[seedName]
    await spinner(`${gerund[cmd]} ${seedName}`, async () => {
      const result = await seed[cmd]()
      return (
        `${seedName} ${result || past_tense[cmd]}. Tables affected: ${
          seed.table_names.join(', ')
        }`
      )
    })
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
