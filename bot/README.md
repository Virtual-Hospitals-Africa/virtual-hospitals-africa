# bot/

The Notion dev bot. Setup, commands, how it works and how to debug it: [docs/bot.md](../docs/bot.md).

- Processes: `orchestrator.sh` (run by `run.sh` in the bot's tmux session) keeps `notion-reader.sh`, `notion-writer.sh`,
  `gh-reader.sh`, `claude-worker-supervisor.sh` and `tester-supervisor.sh` running; the supervisors run
  `claude-worker.sh` (one Claude turn, then a `done`'s checks and PR) and `tester.sh` (one test run).
- State: `events.ts` (the event log's schema), `fold.ts` (the state machine, pure), `state.ts` (its
  CLI for the bash processes and humans), `eventLog.ts` (the log on disk), `reader.ts` (the board
  against the log), `outcome.ts` (a worker's outcome file), `describe.ts` (events in words).
- Running the TypeScript: every bash call goes through `$BOT_TS` (`lib/run-ts.sh`, `deno run` with
  scoped permissions and `--no-lock --no-check`); `io.ts` writes stdout in full.
- Sidebar: `sidebar.ts` (draws it), `sidebarView.ts` (what it shows, pure), `sidebar.sh` (its tmux half).
- Notion: `notion.ts` (the only code that talks to it) and `notionModel.ts`.
- A card's resources: `lib/resources.sh` (ports, `.env`, the two databases), `lib/worktree.sh`,
  `lib/servers.sh` (the web servers a `test/web` run needs).
- Commands: `setup.sh`, `run.sh` (start, stop), `deploy.sh`, `status.sh`, `watch.sh`, `attach.sh`,
  `kill.sh`, `clearall.sh`, `resume.sh`, `test.sh`; each is a `deno task bot:…`. The orchestrator and each
  worker turn run in the bot's tmux session (`lib/tmux.sh`).
- `WORKER.md`: the contract every worker session is given.
- The sandbox a worker runs under is `../host/sandbox-settings.sh`, passed to Claude by `claude-worker.sh`.
