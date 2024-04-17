import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const seeds: Record<
  string,
  {
    load: () => Promise<Deno.CommandOutput>
    dump: () => Promise<Deno.CommandOutput>
  }
> = {}
for (const seedFile of Deno.readDirSync('./db/seed/defs')) {
  const seedName = seedFile.name
  const seed = await import(`./defs/${seedName}`)
  seeds[seedName] = seed.default || seed
}

const seedTargets = Object.keys(seeds).sort()

async function load(target?: string) {
  function targetError() {
    console.error(
      `Please specify a valid target as in\n\n  deno task db:seeds:load ${
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

  if (target) {
    const seed = seeds[findTarget(target)]
    return seed.load()
  }
  for (const seedName of seedTargets) {
    const seed = seeds[seedName]
    await seed.load()
    console.log(`seeds loaded for ${seedName}`)
  }
}

if (import.meta.main) {
  load(Deno.args[0])
}
