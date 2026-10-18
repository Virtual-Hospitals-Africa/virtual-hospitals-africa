# host/

Setup for the machine that runs the [dev bot](../docs/bot.md): `Brewfile` (packages), `setup.sh`
(installs them, starts Colima and Postgres, then runs `deno task bot:setup`) and `sandbox-settings.sh`
(the sandbox and permission rules each worker runs under).

    bash host/setup.sh                      a laptop, or any machine you also work on; no sudo
    bash host/setup.sh --managed-settings   also install the sandbox as Claude Code managed settings (sudo)
    bash host/setup.sh --dedicated          a machine that only runs the bot: the above, and power settings

The sandbox does not depend on the managed install: `bot/claude-worker.sh` gives each worker turn the
settings of `sandbox-settings.sh <worktree>` with `--settings`. The managed install adds the
`sandbox-settings.sh --managed` settings machine-wide, where a worker cannot override them, and applies
them to every Claude Code session on the machine, yours included.

See [Setup](../docs/bot.md#setup) and [Security](../docs/bot.md#security).
