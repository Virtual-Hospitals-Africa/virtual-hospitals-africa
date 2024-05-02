import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const seeds: Record<
  string,
  {
    table_names: string[]
    load: () => Promise<Deno.CommandOutput>
    recreate: () => Promise<Deno.CommandOutput>
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
  recreate: 'recreating',
}

const past_tense = {
  load: 'loaded',
  dump: 'dumped',
  drop: 'dropped',
  recreate: 'recreated',
}

export async function run({ cmd, target }: {
  cmd: 'load' | 'dump' | 'drop' | 'recreate'
  target?: string
}) {
  function targetError() {
    console.error(
      `Please specify a valid target as in\n\n  deno task db:seeds:${cmd} ${
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
    console.log(`${gerund[cmd]} seed ${seedName}`)
    const seed = seeds[seedName]
    await seed[cmd]()
  }
  console.log(`Seeds ${past_tense[cmd]}`)
}

if (import.meta.main) {
  const [cmd, target] = Deno.args[0]
  const recognized_command = !!cmd && cmd in gerund
  if (!recognized_command) {
    console.error(
      'Please provide a valid command name as in\ndeno task db:seed $cmd\nAvailable commands:',
    )
    Object.keys(gerund).forEach((it) => console.error(`  ${it}`))
    Deno.exit(1)
  }

  // deno-lint-ignore no-explicit-any
  run({ cmd: cmd as any, target })
}
