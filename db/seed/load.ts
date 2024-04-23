import last from '../../util/last.ts'
import { assert } from 'std/assert/assert.ts'

const seeds: Record<
  string,
  {
    table_names: string[]
    load: (opts?: { reload?: boolean }) => Promise<Deno.CommandOutput>
    dump: () => Promise<Deno.CommandOutput>
  }
> = {}
for (const seedFile of Deno.readDirSync('./db/seed/defs')) {
  const seedName = seedFile.name
  const seed = await import(`./defs/${seedName}`)
  seeds[seedName] = seed.default || seed
}

const seedTargets = Object.keys(seeds).sort()

export async function load({ target, reload, dump }: {
  target?: string
  reload?: boolean
  dump?: boolean
} = {}) {
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

  const targets = target ? [findTarget(target)] : seedTargets

  for (const seedName of targets) {
    const seed = seeds[seedName]
    await seed.load({ reload })
    console.log(`seeds loaded for ${seedName}`)
    if (dump) {
      await seed.dump()
      console.log(`seeds dumped for ${seedName}`)
    }
  }
}

if (import.meta.main) {
  const first_non_double_dash = Deno.args.find((arg) => !arg.startsWith('--'))
  load({
    target: first_non_double_dash,
    reload: Deno.args.includes('--reload'),
    dump: Deno.args.includes('--dump'),
  })
}
