import { runCommand } from '../util/command.ts'

const APPLICATIONS = {
  "virtual-hospitals-africa": "web",
  "vha-pharmacist-chatbot": "worker",
  "vha-patient-chatbot": "worker",
}

type Application = keyof typeof APPLICATIONS

const COMMANDS = {
  up(app: Application) {
    const dyno_type = APPLICATIONS[app]
    return runCommand('heroku', {
      args: ['ps:scale', `${dyno_type}=1`, `--app=${app}`],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  },
  down(app: Application) {
    const dyno_type = APPLICATIONS[app]
    return runCommand('heroku', {
      args: ['ps:scale', `${dyno_type}=0`, `--app=${app}`],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  },
  async restart(app: Application) {
    await this.down(app)
    await this.up(app)
  },
  logs(app: Application) {
    return runCommand('heroku', {
      args: ['logs', `--tail`, `--app=${app}`],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  },
}

type Command = keyof typeof COMMANDS

function isCommand(cmd?: string): cmd is Command {
  return !!cmd && cmd in COMMANDS
}

function isApplication(app?: string): app is Application {
  return !!app && app in APPLICATIONS
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

APPLICATIONS
  ${Object.keys(APPLICATIONS).join('\n  ')}
`.trim()

if (import.meta.main) {
  let [cmd, app] = Deno.args
  
  if (!cmd || cmd === 'help' || !isCommand(cmd)) {
    console.log(HELP)
    Deno.exit(1)
  }

  if (!app) {
    app = 'virtual-hospitals-africa'
  }
  if (!isApplication(app)) {
    console.log('Please specify an application')
    Deno.exit(1)
  }

  COMMANDS[cmd](app)
}
