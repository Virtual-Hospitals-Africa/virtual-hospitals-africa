import arraysEqual from '../util/arraysEqual.ts'

const migrationFiles = []
for (const migration of Deno.readDirSync('./db/migrations')) {
  migrationFiles.push(migration.name)
}

const branchresult = await new Deno.Command('bash', {
  args: [
    '-c',
    'git branch',
  ],
  stdin: 'null',
  stdout: 'piped',
  stderr: 'piped',
}).spawn().output()

console.log('stdout', new TextDecoder().decode(branchresult.stdout))
console.log('stderr', new TextDecoder().decode(branchresult.stderr))

const cmd = new Deno.Command('bash', {
  args: [
    '-c',
    'git diff main',
  ],
  stdin: 'null',
  stdout: 'piped',
  stderr: 'piped',
}).spawn()

const output = await cmd.output()
const stdout = new TextDecoder().decode(output.stdout)
const stderr = new TextDecoder().decode(output.stderr)

if (output.code) {
  console.error('git diff failed')
  console.log(stderr)
  Deno.exit(1)
}

const lines = stdout.split('\n')

const migrationDiffPrefix = '+++ b/db/migrations'

const newMigrations: string[] = []

lines.forEach((line, index) => {
  if (!line.startsWith(migrationDiffPrefix)) return
  const migrationName = line.slice(migrationDiffPrefix.length + 1)
  const isNew = lines[index - 1] === '--- /dev/null'
  if (!isNew) {
    console.error(`Do not edit existing migrations ${migrationName}`)
    Deno.exit(1)
  }
  newMigrations.push(migrationName)
})

const lastMigrations = migrationFiles.slice(0, newMigrations.length)

if (!arraysEqual(lastMigrations, newMigrations)) {
  console.error(
    'New migrations must be chronological, edit the file names of the new migrations to be after those already on main',
  )
  for (const migration of newMigrations) {
    console.error(migration)
  }
  Deno.exit(1)
}
