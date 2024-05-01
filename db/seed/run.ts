import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const seeds: Record<
  string,
  {
    table_names: string[]
    load: () => Promise<Deno.CommandOutput>
    reload: () => Promise<Deno.CommandOutput>
    dump: () => Promise<Deno.CommandOutput>
    drop: () => Promise<Deno.CommandOutput>
  }
> = {}
for (const seedFile of Deno.readDirSync('./db/seed/defs')) {
  const seedName = seedFile.name
  const seed = await import(`./defs/${seedName}`)
  seeds[seedName] = seed.default || seed
}

const seedTargets = Object.keys(seeds).sort()

const gerund = {
  load: 'loading',
  dump: 'dumping',
  drop: 'dropping',
  reload: 'reloading',
}

const past_tense = {
  load: 'loaded',
  dump: 'dumped',
  drop: 'dropped',
  reload: 'reloaded',
}

export async function run({ fn, target }: {
  fn: 'load' | 'dump' | 'drop' | 'reload'
  target?: string
}) {
  function targetError() {
    console.error(
      `Please specify a valid target as in\n\n  deno task db:seeds:${fn} ${
        seedTargets[0]
      }\n\nValid targets:\n${seedTargets.join('\n')}`,
    )
    return Deno.exit(1)
  }

  function findTarget(target: string) {
    const target_file = last(target.split('/'))
    assert(target_file)
    const matching_targets = seedTargets.filter((it) =>
      it.includes(target_file)
    )
    if (matching_targets.length === 1) {
      return matching_targets[0]
    }
    return targetError()
  }

  const targets = target ? [findTarget(target)] : seedTargets

  for (const seedName of targets) {
    console.log(`${gerund[fn]} seed ${seedName}`, )
    const seed = seeds[seedName]
    await seed[fn]()
  }
  console.log(`Seeds ${past_tense[fn]}`)
}

if (import.meta.main) {
  run({
    fn: Deno.args[0] as 'load' | 'dump' | 'drop' | 'reload',
    target: Deno.args[1],
  })
}
