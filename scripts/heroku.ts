import { runCommand } from '../util/command.ts'

const APPLICATIONS = {
  'virtual-hospitals-africa': 'web',
  'vha-pharmacist-chatbot': 'worker',
  'vha-patient-chatbot': 'worker',
}

type Application = keyof typeof APPLICATIONS

function heroku(args: string[]) {
  return runCommand('heroku', {
    args,
    stdout: 'inherit',
    stderr: 'inherit',
  })
}

const COMMANDS = {
  up(app: Application) {
    const dyno_type = APPLICATIONS[app]
    return heroku(['ps:scale', `${dyno_type}=1`, `--app=${app}`])
  },
  down(app: Application) {
    const dyno_type = APPLICATIONS[app]
    return heroku(['ps:scale', `${dyno_type}=0`, `--app=${app}`])
  },
  async restart(app: Application) {
    await this.down(app)
    await this.up(app)
  },
  logs(app: Application) {
    return heroku(['logs', `--tail`, `--app=${app}`])
  },
}

type Command = keyof typeof COMMANDS

function isCommand(cmd?: string): cmd is Command {
  return !!cmd && cmd in COMMANDS
}

const HELP = `
CLI to interact with Heroku

USAGE
  $ deno task heroku [COMMAND] [APP]

COMMANDS
  up         Scale up dyno
  down       Scale down dyno
  restart    Restart dyno
  logs       Show logs

APPS
  ${Object.keys(APPLICATIONS).join('\n  ')}
`.trim()

function asApplication(app?: string): Application | null {
  if (!app) return 'virtual-hospitals-africa'
  if (app in APPLICATIONS) return app as Application
  const matches = Object.keys(APPLICATIONS).filter((it) => it.includes(app))
  if (matches.length === 1) return matches[0] as Application
  return null
}

if (import.meta.main) {
  const [cmd, app_arg] = Deno.args

  if (!cmd || !isCommand(cmd)) {
    console.log(HELP)
    Deno.exit(1)
  }

  const app = asApplication(app_arg)
  if (!app) {
    console.log(
      `Please provide a valid app name as in\n\ndeno task heroku ${cmd} virtual-hospitals-africa\n\nValid apps:\n  ${
        Object.keys(APPLICATIONS).join('\n  ')
      }`,
    )
    Deno.exit(1)
  }

  COMMANDS[cmd](app)
}
