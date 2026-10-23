# Dev bot

The dev bot works development cards from the Notion **Tasks** board. Tick a card's **Bot** checkbox
and the bot gives the card its own git worktree, its own ports and its own databases, and has a
Claude Code worker implement it. The worker asks questions as card comments, and you answer by
replying on the card. When the worker says it's done, the bot merges `origin/main`, runs the checks
(typecheck, fmt, lint, hygiene and the tests outside `test/web`, side by side) and opens a PR; its URL
goes in the card's **PR** field, and the card is **Awaiting CI**. The PR's CI is the gate: the bot's
own checks are the quick ones, run while an agent can still fix what they find. The card moves to
**QA** once CI passes, or goes back to the worker if it fails. Round-trip web tests (`test/web`) are
run on request, on the card's own servers, by the bot's tester.

It runs on a Mac: a laptop to begin with, or a dedicated machine.

- [Setup](#setup)
- [Running](#running)
- [How it works](#how-it-works)
- [Debugging](#debugging)

Every command here works in bash, zsh and fish.

## Setup

Once, on the bot's machine, as the user the bot runs as. The bot runs from a checkout of this repo on
`main` (the **bot's checkout**) and puts its worktrees next to it, in a `vha-bot-worktrees/` folder
(`BOT_WORKTREES`). On a laptop you also work on, make the bot a clone of its own rather than using the
one you work in: the bot takes over that checkout's branch (`bot:deploy` pulls `main` into it) and
creates worktrees from it. In the examples that is `~/dev/morehumaninternet/vha-bot`, so the
worktrees are in `~/dev/morehumaninternet/vha-bot-worktrees/`.

| # | Step                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| - | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | **Notion connection.** Notion › Settings › Connections › Develop or manage integrations (workspace _More Human Internet_): create an internal integration, "VHA Bot", with _read content_, _update content_, _insert content_, _read comments_ and _insert comments_ (no user information needed). Then open the **✅ Tasks** database › `•••` › **Connections** › add it. Keep its token for step 5.                                                                                                 |
| 2 | **GitHub machine user.** A token for the account the bot pushes and opens PRs as (`GH_TOKEN`). Branch protection keeps it off `main`. Without one the bot works cards but cannot open PRs.                                                                                                                                                                                                                                                                                                            |
| 3 | **Claude Code**, logged in to the Max plan: run `claude`, then `/login`.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4 | **The checkout.** `git clone` it, stay on `main`, run `deno install --allow-scripts` in it (each worktree's packages are cloned from its `node_modules`), and make **`db/dumps/latest`**: a dump of `main`'s database, which every card's databases are restored from (`deno task docker db:rebuild && deno task docker db:dump > ./db/dumps/latest`, in that checkout; or point `BOT_DB_DUMP` at a dump you already have). It is gitignored. A dump older than `BOT_DUMP_MAX_AGE_DAYS` blocks cards. |
| 5 | `bash host/setup.sh`. It installs the Brewfile, starts Colima (unless Docker already answers) and the Postgres in `docker-compose.yml`, then runs `deno task bot:setup`. Add `--managed-settings` or `--dedicated` for a dedicated machine ([Security](#security)).                                                                                                                                                                                                                                   |
| 6 | `deno task bot:setup` (run by step 5; re-run it any time, Enter keeps a value). It checks the tools, writes `.bot/bot.env`, checks the Notion connection and offers to add the 7 board properties the bot uses (**Bot**, **Bot hold**, **Bot state**, **Bot session**, **Worktree**, **Last comment**, **PR**), and checks the Postgres and the dump. Paste the token, press Enter at the data-source prompt (Enter keeps VHA's Tasks board), and answer `y` to add the properties.                   |
| 7 | `deno task bot:start`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

The bot needs `deno`, `docker` (a reachable daemon), `psql`, `pg_restore`, `tmux`, `curl`, `lsof`,
`jq`, `gh`, `claude` and bash 5 on its PATH (`BOT_PATH`, which names Homebrew's `libpq` for `psql` and
`pg_restore`, and `~/.deno/bin`). The Brewfile also has `ripgrep` (hygiene needs `rg`), `node` (`deno
task db:codegen` runs `npm install`), `bats-core` and `shellcheck` (the bot's own tests).

`pg_restore` and the server should be the same major version (16). A newer `pg_restore` restoring a
dump made by `pg_dump` 17 or later into the 16 server fails on `SET transaction_timeout`, which changes
nothing: the bot counts a restore whose only errors are that one as restored. A dump made with
`deno task docker db:dump` is made inside the server's own container, so it does not meet the case.

On a dedicated machine, by hand, in System Settings: FileVault off, automatic login as this user, and
Tailscale, Remote Login (SSH) and Screen Sharing on, so the bot comes back by itself after a power cut
and you can reach it.

### Settings

These live in `.bot/bot.env`, which is owner-only and never committed. A change takes effect on the
next `deno task bot:start`.

| Setting                   | Default                                                                       | What it does                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NOTION_TOKEN`            | (required)                                                                    | The Notion integration's token                                                                                                                             |
| `NOTION_DATA_SOURCE_ID`   | VHA's Tasks data source                                                       | The board to read; only another board needs a change                                                                                                       |
| `GH_TOKEN`                | (none)                                                                        | The machine user's GitHub token, used only to push and open PRs, to read their CI, and to look for merged PRs                                              |
| `BOT_WORKERS`             | 2                                                                             | Claude worker turns at once. 2 suits a 16 GB laptop: each card also has two databases and, while its worker tests, a Deno test load. Raise it on a bigger machine. |
| `BOT_TESTERS`             | 1                                                                             | Test runs at once, across all cards. Each web run is a vite server, an HTTPS proxy, an events processor and a Postgres load, so measure before raising it. |
| `BOT_TEST_CAP_SECONDS`    | 2700                                                                          | A test run is stopped after this long                                                                                                                      |
| `CHECKS_CAP_SECONDS`      | 1800                                                                          | A `done`'s checks are stopped after this long                                                                                                              |
| `BOT_SESSION_CAP_SECONDS` | 5400                                                                          | A worker turn is stopped after this long                                                                                                                   |
| `BOT_MAX_FAILED_RUNS`     | 5                                                                             | A worker's failed test runs in a row before its card is blocked                                                                                            |
| `BOT_PERMISSION_MODE`     | `auto`                                                                        | The workers' Claude Code permission mode                                                                                                                   |
| `BOT_PORT_BASE`           | 21000                                                                         | A card's ports are `BOT_PORT_BASE + 2i` (the HTTP server) and `+ 2i + 1` (the HTTPS proxy) for its block `i`: 21002 and up                                 |
| `BOT_DB_DUMP`             | `<bot's checkout>/db/dumps/latest`                                            | The dump every card's databases are restored from                                                                                                          |
| `BOT_DUMP_MAX_AGE_DAYS`   | 30                                                                            | A dump older than this blocks cards with `dump_stale` until a human makes a new one                                                                        |
| `BOT_DB_URL`              | the `DATABASE_URL` of the checkout's `.env.docker`, without its database name | The Postgres the cards' databases are made on                                                                                                              |
| `BOT_DB_MIGRATE`          | `deno task local db:migrate latest`                                           | Run in a worktree, to bring its databases to its latest migration                                                                                          |
| `BOT_TMUX_SOCKET`         | `vhabot`                                                                      | The bot's tmux server, where each worker turn is a window: `tmux -L vhabot attach` ([watching a worker](#watching-a-worker))                               |

## Running

### The bot

| To                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Run                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Start it, or restart it after changing a setting. Also after logging in or a restart: nothing starts it for you. Every card's worktree is first brought up to `origin/main`; one that won't merge, or that a talk window is open on, is left as it was (`worktree.unmerged`): before the worker's next turn, `claude-worker.sh` commits its uncommitted work and merges, outside the sandbox, leaving a real conflict in progress for the worker to resolve. | `deno task bot:start`                                                  |
| Stop it. Running workers and tests are stopped and recorded as interrupted, so they're resumed when it starts again. Any web server or events processor left running in a card's worktree is stopped too (`bot:start` does the same).                                                                                                                                                                                                                        | `deno task bot:stop`                                                   |
| Update it to `origin/main` and restart (when an update changes how tests run, deploy while no card is testing)                                                                                                                                                                                                                                                                                                                                               | `deno task bot:deploy`                                                 |
| See what it's doing                                                                                                                                                                                                                                                                                                                                                                                                                                          | `deno task bot:status`                                                 |
| See one card, with the end of its log                                                                                                                                                                                                                                                                                                                                                                                                                        | `deno task bot:status -- <card>`                                       |
| Follow every card's events live                                                                                                                                                                                                                                                                                                                                                                                                                              | `deno task bot:watch`                                                  |
| Follow everything about one card live                                                                                                                                                                                                                                                                                                                                                                                                                        | `deno task bot:watch -- <card>`                                        |
| Watch every running worker, type to one, or stop what it's doing ([watching a worker](#watching-a-worker))                                                                                                                                                                                                                                                                                                                                                   | `deno task bot:attach [-- <card>]`                                     |
| Take a card back for good: stop it, drop its databases, delete its worktree (the branch is kept), untick **Bot**                                                                                                                                                                                                                                                                                                                                             | `deno task bot:kill -- <card>`                                         |
| Start over: delete every card's worktree (the branches and the folder are kept), every bot database and the event log, while stopped                                                                                                                                                                                                                                                                                                                         | `deno task bot:clearall [-- --yes]`                                    |
| Run a command yourself on a card's worktree, on its ports and databases                                                                                                                                                                                                                                                                                                                                                                                      | `deno task bot:test -- <card> [--servers\|--no-servers] -- <command…>` |
| Talk to a card's worker: its live window while it runs, else its own session in its worktree                                                                                                                                                                                                                                                                                                                                                                 | `deno task bot:resume -- <card> [--fork-session]`                      |

`<card>` is the card's id, either the 32 hex characters at the end of its Notion URL or the dashed
form, or its branch name (`bot_<title>_<id>`).

### Watching a worker

The bot has a tmux session where you can see all of it at once: its own processes, and every worker
turn, each an ordinary interactive Claude. Attach whenever you like; from Notion a card stays
_Working_ throughout.

```
deno task bot:attach                     # the session (made if there is none), at the bot window
deno task bot:attach -- <card>           # straight to that card's window
```

| Window                   | What it shows                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `bot`                    | `bot:status`, redrawn every 5 s, over the orchestrator itself, which every bot process writes to |
| `events`                 | the event log, as `bot:watch` shows it                                                           |
| `<title>-<id's first 4>` | one per running worker turn, gone when the turn ends                                             |

`C-b w` lists the windows and `C-b d` detaches, leaving everything running. Both commands are `tmux -L
vhabot attach` underneath, work from inside your own tmux too, and put back a fixed window you closed
(`bot:resume -- <card>` also takes you to a card's window while it runs).

The bot itself runs here too: `bot:start` runs the orchestrator in the `bot` window's lower pane (its
output also goes to `.bot/orchestrator.log`), and `bot:stop` stops it there. Detaching or closing your
terminal leaves it running; `tmux -L vhabot kill-server`, logging out or a restart stops it, and
nothing brings it back until the next `bot:start`. When the orchestrator exits, its pane stays on
screen with its last lines, so you can see why.

In a card's window it's Claude as you know it: type to it and your note joins the turn it's on; Esc
stops what it's doing and leaves it waiting for you.

While you're looking at a window, its turn stays open: the bot ends it only once Claude is done (it
has stopped, or you pressed Esc) and nobody has looked at its window for `BOT_DETACH_GRACE_SECONDS`
(10 s). Time you spend watching doesn't count toward `BOT_SESSION_CAP_SECONDS`. If Claude ends without
writing `.vha/outcome.json`, the bot resumes it with that, as with any turn. Closing a card's window
(`C-b &`, or `/exit`) ends the turn with no result, so the card is resumed on the next look at the
queue; to pause a card, tick **Bot hold**.

### The sidebar

Down the left of whichever window you're on is the sidebar (`bot/sidebar.ts`): whether the bot is
running, then every live card, running ones first, then the ones waiting on you, then the queue. Each
card has two lines: its title and a `notion ↗` link, then its state (a card finished by its merged PR
shows its Notion Status, `QA`, instead), what's running on it and for how long (`claude · turn 3 ·
12m04s`, `tester #1 · run · 3m10s`), or how long it has been in that state and what's there: its
<u>worker</u> session to talk to, `worktree gone` when its worktree is no longer on disk (the log
still names it; nothing of the card can run there), or `no worktree yet`.

| Click                 | Takes you to                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------ |
| a running worker      | its window                                                                                 |
| an idle <u>worker</u> | `talk-<name>`: Claude, resumed on the card's session in its worktree, as `bot:resume` does |
| a running test        | `test-<name>`: the run's `build.log`, `servers.log` and `command.log`, as they are written |
| any other card        | `log-<name>`: its `card.log`, as `bot:watch -- <card>` shows it                            |
| `notion ↗`            | the card in your browser (⌘-click on the title opens it too)                               |

A click on a card's window counts as [watching it](#watching-a-worker), so its turn stays open while
you're there. While a `talk-` window is open the bot starts no turn on that card (it is passed over,
`.vha/talk.window`); close it (`/exit`) and what you said there joins the session the bot resumes
next. Closing it is a reply (`card.talked`) when you typed anything there or the worker wrote
`.vha/outcome.json`: a card _Waiting on you_ is queued again, and its next turn opens on that outcome
(kept, not deleted) and ends at once if it still stands, so a `run` or `done` agreed in a talk happens.
Closing it with nothing said leaves the card as it was. The wheel scrolls the list. The `test-` and
`log-` windows stay until you close them (`C-b &`); clicking the card again starts them afresh.

It is one pane, which the session's `session-window-changed` and `client-attached` hooks move into the
window you go to (`bot/sidebar.sh place`). Close it and the next window you go to starts it again.
`BOT_SIDEBAR_WIDTH` (44) sets its width. The hooks are set by `bot:attach` and `bot:start`; `bot:stop`
closes the sidebar, and `bot:start` starts it afresh, on the code as it is now, in the window you're
at.

### A card, from Notion

The **Bot** checkbox is the only gate: tick it on a card whose Status is **Not started** (and **Bot
hold** is not ticked) and the bot admits it. The card's type, Modules and Assignee don't matter, and a
card that is only a title is normal: the worker reads the code, then asks in a comment. A **Postponed**
priority is admitted too, ranked after Low and after cards with no priority. A person always ticks
**Bot**; the bot never does.

| To                                                            | Do                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hand a card to the bot                                        | Tick **Bot** on a card whose Status is **Not started**.                                                                                                                                                                                              |
| Answer the bot's question (**Bot state** is _Waiting on you_) | Reply in a comment on the card. Attached files reach the worker.                                                                                                                                                                                     |
| Pause it, keeping everything                                  | Tick **Bot hold**. A worker or test already running finishes; nothing new starts until you untick it.                                                                                                                                                |
| Unblock a **Blocked** card                                    | Comment first if the worker should know something, then set **Bot state** to **Queued**. The worker is told it was unblocked and why it had stopped, and its retry counts start over. A card blocked for its dump (below) is unblocked the same way. |
| Take it back                                                  | Untick **Bot**: the same as `bot:kill`.                                                                                                                                                                                                              |
| Finish it, once the PR is merged                              | Move it to **Done**. The bot removes the worktree, drops the card's databases and deletes the merged branch. A **Blocked** card whose PR you merged moves itself to **QA** within a minute.                                                          |

The bot moves **Status** from **Not started** to **In progress** when a worker first starts, and to
**QA** when the card is Finished; it never moves a card out of **QA** or **Done**. The properties it
adds and keeps are **Bot**, **Bot hold**, **Bot state**, **Bot session**, **Worktree**, **Last
comment** and **PR**; the rest of the board is yours.

A card whose databases cannot be made is **Blocked** with a reason, not retried. `dump_missing`:
`db/dumps/latest` does not exist (or is a Git LFS pointer). `dump_stale`: it is older than
`BOT_DUMP_MAX_AGE_DAYS`, or `pg_restore` cannot read it. Either way a human makes the dump (`deno task
docker db:rebuild && deno task docker db:dump > ./db/dumps/latest`, in the bot's checkout), then sets
**Bot state** to **Queued**. A Postgres that is down is waited out, not blocked.

## How it works

### Processes

```
deno task bot:start → bot/orchestrator.sh, in the bot window of tmux -L vhabot
  ├─ bot/notion-reader.sh             every 60 s: what humans did on the board → events
  ├─ bot/notion-writer.sh             the bot's state → Notion, one write at a time
  ├─ bot/gh-reader.sh                 every 60 s: Blocked cards whose branch's PR was merged, and Awaiting CI cards' checks → events
  ├─ bot/claude-worker-supervisor.sh  owns the worktrees and each card's resources; up to BOT_WORKERS × bot/claude-worker.sh <card>
  └─ bot/tester-supervisor.sh         up to BOT_TESTERS × bot/tester.sh, each in its card's worktree
```

- **The orchestrator** starts the five and restarts any that exits, 5 s later. One that exits five
  times in five minutes is left down; `bot:status` shows it as DOWN. Nothing restarts the orchestrator
  itself: `bot:start` runs it, with `BOT_PATH` and a UTF-8 locale whatever your shell has, and
  `bot:stop` gives it `BOT_STOP_SECONDS` (120) to stop the five before killing it.
- **Each supervisor** loops every 5 seconds: it reaps children that have ended, stops any whose card
  was withdrawn or done, and starts new ones while it has room. It asks the event log what to start
  next.
- **Each child** handles one card once and exits: `claude-worker.sh` one Claude turn, `tester.sh` one
  test. It ends by recording what happened as an event. If a child dies without recording anything,
  its supervisor records it as interrupted, and the card goes back in the queue.
- **On restart**, a supervisor stops whatever its previous run left running (found by the pid files in
  each worktree's `.vha/`) and records those as interrupted.

<a id="events"></a>

### The event log

`.bot/events.jsonl` is the bot's single source of truth: one JSON event per line, append-only. Each
event's id is its line number. Every decision comes from reading the whole log:
[bot/fold.ts](../bot/fold.ts) turns it into each card's state, and [bot/state.ts](../bot/state.ts)
answers the supervisors' questions from that ("which card's worker is next", "which test", "what does
Notion still lack"). The event types are defined in [bot/events.ts](../bot/events.ts).

Notion is only an input and a mirror:

- The **reader** compares the board with the log and records what changed: a card ticked, held,
  released, re-prioritized, replied to, unblocked, unticked, or moved to Done.
- The **writer** copies to Notion what the log says each card should show (**Bot state**, Status,
  **Bot session**, **Worktree**, **PR**, **Last comment**) and posts the bot's comments. Each write is
  acknowledged with an event, so a failed one is retried, 5 s doubling to 5 minutes, and none is lost.
  It never moves a card whose Status is already **QA** or **Done**.

GitHub is an input too: the **gh-reader** looks, for each Blocked card that still has its worktree,
for a merged PR from the card's branch (`gh pr list --head <branch> --state merged`, as the machine
user). One that has it is recorded as `pr.merged`: a human took the card the rest of the way, so the
bot finishes it: **Bot state** _Finished_, the PR on the card, a comment saying so, and Status **QA**
unless it is already **QA** or **Done**. An open or closed PR leaves the card Blocked. Moving it to
**Done** then removes it as any other.

The gh-reader also reads the checks on the PR of each **Awaiting CI** card (`gh pr view --json
statusCheckRollup`, judged by `bot/lib/ci.jq`): every check passed or skipped is `ci.passed`, which
finishes the card; any one failed is `ci.failed`, at once even while others still run, which sends the
card back to the worker with the names of the checks that failed. A PR that merged meanwhile finishes
the card too. Checks still running, or not started, are waited for, but a PR no check ever started on
(one no workflow's `paths` cover) counts as passed once the card has waited `BOT_CI_GRACE_SECONDS`
(600).

Every event is checked before it's appended. One that the state machine wouldn't accept is refused, so
a bad write can't wedge the bot.

### A card's life

```
admitted ─▶ Queued ─worker starts─▶ Working
Working ─asks─▶ Waiting on you ─reply, or a talk window closed─▶ Queued
Working ─run─▶ Queued for test run ─tester starts─▶ Testing ─finished─▶ Queued   (the worker resumes with the result)
Working ─done─▶ Checking ─passed, PR pushed─▶ Awaiting CI
Checking ─failed or conflicted, or the push failed─▶ Queued                    (the worker resumes with why)
Awaiting CI ─CI passed, or the PR merged─▶ Finished                            (Status: QA)
Awaiting CI ─CI failed─▶ Queued                                                (the worker resumes with the failed checks)
Working ─blocked─▶ Blocked ─human sets Queued─▶ Queued
Blocked ─its branch's PR merged─▶ Finished                                       (Status: QA, unless already QA or Done)
Queued ─no dump, or a stale one─▶ Blocked ─human makes the dump, sets Queued─▶ Queued
Working ─usage limit─▶ Paused ─limit resets─▶ Queued
interrupted: Working or Checking ─▶ Queued · Testing ─▶ Queued for test run
unticked, killed or Done ─▶ Gone                          (stopped; databases dropped; worktree removed)
```

In Notion a card in _Checking_ shows as _Working_.

The worker ends every turn by writing `.vha/outcome.json` (the contract is
[bot/WORKER.md](../bot/WORKER.md)):

| Outcome   | What the bot does                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ask`     | Posts the question (and its attachments) on the card and waits for a reply.                                                                                                                                                                                                                                                                                                                                                                 |
| `run`     | `{command, servers?, why?}`. Runs the worker's command on a tester, at the branch's last commit (a `run` with uncommitted changes is refused), then resumes the worker with the exit code, the run dir and the end of the log. The web servers are started first when `servers` is true, or unset and the command names `test/web` or is a bare `deno task test`. A failed run is also posted on the card in one line.                      |
| `done`    | `{summary, prTitle, prBody}`. In the worker's own turn: [a done](#a-done): merges `origin/main`, runs the protected-path gate, then the checks. If they all pass it pushes the branch and opens the PR (or updates the open one), puts its URL in the **PR** field and posts the summary and the link on the card, which then waits for CI. If the checks or CI fail, the worker is resumed to fix it; its next `done` updates the same PR. |
| `blocked` | Posts the reason on the card; a human has to act.                                                                                                                                                                                                                                                                                                                                                                                           |

The bot also blocks a card itself, posting why, after 5 failed runs in a row, 3 failed `done`s in a
row (checks or CI), 2 turns in a row without a valid outcome, 2 turns that ran past the time cap, 3
failed PR attempts, or 3 failed worktree creations; at once when its dump is missing or stale (see
above). It also blocks a branch that changed a protected file ([Security](#security)).

A usage limit on the Max plan pauses every worker until the reset time.

### A worker turn

The worker supervisor makes a card's worktree before its first turn ([a card's resources](#a-cards-resources)): `git worktree add` on a new branch from `origin/main`, or on the
card's old branch if it has one. The checkout itself is never touched. Into the new worktree it clones
the gitignored packages (`node_modules`, `db/codegen/node_modules`), and gives the worktree its own
ports, databases and `.env`.

`claude-worker.sh` then runs interactive `claude` in the worktree, in a new window of the bot's tmux
session ([watching a worker](#watching-a-worker)). The first turn gets the card, its comments, and a
pointer to `WORKER.md`, under a session id the worker picks. Later turns `--resume` the same session
with what happened since: replies, a test result, an interrupt, an unblock. Claude runs with an
allowlisted environment, so no token reaches it, [sandboxed](#security), and is stopped after
`BOT_SESSION_CAP_SECONDS` of nobody watching.

An interactive Claude doesn't exit when it's done, so the worker follows it through hooks given with
`--settings` (`bot/lib/turn-hook.sh`): each `UserPromptSubmit`, `Stop`, `StopFailure` and
`SessionEnd` is a line in `.vha/hooks/<n>.jsonl`. The first names the session and its transcript,
which the worker follows into `card.log`. The turn is over when Claude has stopped (or was stopped
with Esc, which fires no hook and is read off the transcript), with no background task still running
unless it has written its outcome, and nobody is looking at its window. The worker then closes the
window and keeps the turn's part of the transcript as `.vha/sessions/<n>.jsonl`. A turn that ended on
an API error saying "limit" is a usage limit. A Claude that hasn't taken its prompt after
`BOT_START_SECONDS` (120) is stuck on something on its screen, which the failure quotes.

The worker runs its own tests and type checks: `deno check`, `deno task test <files>` and `deno task
local db:migrate latest` run in its sandbox against its own databases, as in any worktree. It never
runs `deno task docker …`, `deno task switch:*`, `db:rebuild`, `db:reset`, `db:drop` or `docker`: they
point `.env` at a human's database or reset shared state, and the sandbox refuses them. `test/web` is
the one thing it asks for as a `run`.

### A done

`claude-worker.sh` runs a `done` in the worker's own turn, once Claude has stopped:

1. it merges `origin/main` into the branch (a conflict goes back to the worker; a conflict in `db.d.ts`
   alone is resolved by taking main's, migrating the card's databases and regenerating it with `deno
   task db:codegen`, which reads only the card's dev database), then runs the protected-path gate;
2. it runs the checks, side by side, in the worktree on the card's own ports and databases
   (`bot/lib/run-checks.sh`, `bash bot/lib/run-checks.sh --list` names them): `deno check`, `deno fmt
   --check`, `deno lint`, `deno task hygiene` and `deno task test --ignore=test/web`. The first to
   fail stops the rest, and the card hears which; `.vha/checks/<n>.log` has a section for each, written
   as it ends. `test/web` is not among them: it is slow and heavy, so it is the worker's own `run`, and
   CI runs everything;
3. if they all pass, it pushes the branch and opens the PR (`bot/lib/pr.sh`, as the machine user), and
   the card waits for CI.

### A card's resources

Each card owns, from its worktree's creation to its removal (`bot/lib/resources.sh`):

- **Two databases** on the Postgres at `BOT_DB_URL`: `vha_dev_bot_<first 8 hex of the card id>` and
  `vha_test_bot_<same>`. Each is restored from `db/dumps/latest` (the two restores run side by side)
  and migrated to the worktree's latest migration (`BOT_DB_MIGRATE`); the output is
  `.vha/db.log`. The repo's code rewrites `vha_dev` to `vha_test` under `IS_TEST`, so the card's
  worktree, whose `DATABASE_URL` names the first, tests against the second. They are dropped with the
  worktree (never with `db:drop`, which also flushes the shared Redis); `bot:clearall` and the worker
  supervisor, as it starts, also drop any bot database no card owns. A card's databases found gone
  (`docker compose down -v`) are made again before its next turn.
- **A pair of ports**: block `i` (the lowest no other bot worktree uses, 1 to 200) has `HTTP_SERVER_PORT
  = BOT_PORT_BASE + 2i` and `HTTPS_PROXY_SERVER_PORT` one above it, so 21002 to 21401 with the default
  base. The base is clear of a human's worktrees (8004 and up), Postgres, Redis and adminer.
- **Its own `.env.local` and `.env`**: the checkout's `.env.docker` with the card's database and ports.
  Only an allowlist of the checkout's `.env.extra` (`GOOGLE_CLIENT_ID` and the `VAPID_*` keys) is added
  to `.env`, so no token the worker could read is there.
- **`.vha/ports.env`**, which every check and test sources to be on its own ports and database.

Redis is shared and not isolated: nothing writes to it today.

### A test

`tester.sh` gets its card and its request from the tester supervisor, and runs in the card's own
worktree, on its ports and databases, with a run dir of its own, `.vha/runs/<yyyymmdd-hhmmss>-bot-<kind>/`.
While a card is testing its worker isn't running, so nothing else uses them. It:

1. brings the branch up to `origin/main` (a conflict goes back to the worker) and through the
   protected-path gate;
2. refuses a worktree with uncommitted changes to tracked files (they would be tested as the commit),
   installs packages if the lockfile changed, and checks the card's databases are there;
3. if the command needs the web servers (`test/web`), starts them first on the card's ports, with the
   repo's own `scripts/test/run_servers.sh` (`bot/lib/servers.sh`): the HTTP server, the HTTPS proxy
   and the events processor, waited on until the proxy's `/health-check` answers (up to 300 s: a cold
   vite start is longer than the 25 s `deno task test` would wait). With `--use-build` in the command
   the app is built first (`deno task build`);
4. runs the command with the card's environment (`runs/<run>/command.log`), capped at
   `BOT_TEST_CAP_SECONDS` (45 minutes), then stops the servers and the events processor, so none is
   left running on code that has since changed, and copies their logs into the run dir.

A failed run whose proxy log has responses with empty headers is the known bare-400 flake of parallel
web tests; the failure says so. Rerun the failing files alone before suspecting the change. A test is
not run in the sandbox: only the worker is.

### Files

```
~/dev/morehumaninternet/vha-bot/.bot/                the bot's own files (gitignored)
  events.jsonl                         the event log
  bot.env                              settings and tokens
  processes.json                       what the orchestrator is running
  orchestrator.log                     the processes' own output: starts, stops, crashes

~/dev/morehumaninternet/vha-bot-worktrees/bot_<title>_<card id>/.vha/
  card.json                            { id, title }
  ports.env                            this worktree's ports and database
  db.log                               the output of making its databases
  card.log                             everything about the card (below)
  sessions/<n>.jsonl                   each worker turn's part of the session transcript
  hooks/<n>.jsonl, <n>.prompt          turn n's hook events, and the prompt it was given
  hooks/settings.json                  the sandbox, permission rules and hooks the worker gives Claude
  transcript                           where Claude keeps the session's transcript
  outcomes/<n>.json                    each turn's outcome
  inbox/                               replies and their attachments
  runs/<yyyymmdd-hhmmss>-bot-<kind>/   one per test: run.json, command.log, build.log, servers.log,
                                       and server.log, proxy.log, events.log
  runs/latest                          the newest run that has finished
  runs/current                         the running test's run, from when it has one (the sidebar's)
  checks/<n>.log                       turn n's checks before the PR
  worker.pid, tester.pid               the running child, while there is one
  worker.window                        the running worker's tmux window
  talk.window                          the sidebar's talk with its worker session, while it is open
```

(Its worktree also has its own `.env.local` and `.env`, and `logs/` while a test's servers run.)

### Security

A worker is an agent running commands on the bot's machine on the strength of a Notion card, so it is
fenced in. What it can't do, and how:

- **The sandbox.** Every worker turn runs under the settings `host/sandbox-settings.sh <worktree>`
  prints, which `bot/claude-worker.sh` hands to Claude with `--settings` each turn. It sandboxes the
  worker's shell commands (macOS Seatbelt) with `failIfUnavailable` (a worker never starts
  unsandboxed) and `allowUnsandboxedCommands: false` (no retry outside it). Inside it a command can
  write only the worktree, the temp directory, the checkout's `.git` (where a worktree's commits go) and
  the Deno and npm caches, never the protected paths, `.bot/` or the turn's hook settings; can't read
  `.bot/bot.env`, `.env*` in the bot's checkout (`.env.extra` holds the real tokens), or credential
  directories (`~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh`, `~/.docker`, `~/.netrc`); can reach
  `localhost` (Postgres, its own ports), and only `jsr.io`, `deno.land`, `registry.npmjs.org` and
  `raw.githubusercontent.com` beyond it; and can't connect to any Unix socket, which is what keeps the
  Docker daemon out of reach. The same list is also given as permission rules (`Edit`, `Read`, and
  `Bash` denies for `deno task docker`, `switch:*`, `db:rebuild`, `db:reset`, `db:drop`, `docker`, `git
  push` and `gh`), which cover Claude's own file tools, which the sandbox does not.
- **The protected paths** are the lines of [scripts/protected-paths.txt](../scripts/protected-paths.txt):
  the gates themselves (`scripts/code-quality/check.sh`, `scripts/code-quality/hygiene.sh`,
  `.github/**`), the bot (`bot/**`, `host/**`) and the gate that guards it. The sandbox stops a worker
  writing them, and [scripts/protected-gate.sh](../scripts/protected-gate.sh) refuses a branch that
  changed one (a `done` or a `run` ends the card **Blocked**, with the files named): a human makes the
  change. The sandbox settings are made from the same list, so the two can't drift.
- **Nothing of the machine's own Claude Code setup** reaches a worker: it runs with
  `--setting-sources project,local` and `--strict-mcp-config`, so not your user settings, hooks and
  plugins, and not your MCP servers (on a laptop, those can include Notion with write access).
- **Tokens.** The bot's processes read them but never export them, and a worker, check or test runs in
  an allowlisted environment (`ISOLATED_ENV`). The Notion token goes only to the `bot/notion.ts` calls,
  and the GitHub token only to the PR steps. A worktree's `.env` carries only the allowlisted part of
  `.env.extra`.

What it does not fence in, so you can weigh it:

- **Localhost is open to the whole worker.** On macOS the sandbox can allow either no connection to
  localhost or every port (`allowLocalBinding`), not 5432 and 21002 to 21401 alone. A worker can
  therefore connect to the same Postgres as every card, and the repo's `.env.docker` logs in as its
  superuser (`vha_superadmin`): a worker could read or drop the human's `vha_dev`. Nothing in the
  worker's instructions allows it and the sandbox is no barrier to it. This is an accepted risk: the
  bot shares the human's Postgres (each card gets its own dev and test databases, never `vha_dev` or
  `vha_test`), so keep a recent dump of anything in `vha_dev` you would mind losing. A machine whose
  Postgres should be out of a worker's reach can give the bot its own (`BOT_DB_URL`).
- **The sandbox covers shell commands.** Claude's file tools, MCP servers and hooks run outside it.
  Permission rules cover the file tools, `--strict-mcp-config` removes every MCP server, and Claude
  Code's sandbox itself write-protects the worktree's `.claude/` settings, hooks and skills and its
  `.mcp.json` against a command (the `Edit` rules add `.claude/**` for the file tools), so a worker
  cannot plant a hook that would run outside it.
- **A talk window is not sandboxed.** `bot:resume` and the sidebar's `talk-` windows are plain Claude
  on the worker's session, with you at the keyboard: what you approve there is yours.
- **A worker can write other branches' refs** in the checkout's `.git`, which a worktree's commit
  needs write access to.

#### Per turn, or managed

By default the sandbox travels with each worker turn, in `--settings`, and nothing is installed on the
machine: a laptop's own Claude Code sessions are not sandboxed or restricted by the bot. The Claude
Code documentation ranks `--settings` just under managed settings and above the worktree's
`.claude/settings.json` and `.claude/settings.local.json` and your user settings, and says that
`allowUnsandboxedCommands: false` given with `--settings` makes the sandbox admin-required: Claude then
ignores the settings in the worktree's repository files that would loosen it (`excludedCommands`,
`allowWrite`, `allowedDomains`, `allowLocalBinding: true`, …). The worker also loads only the
worktree's own settings files, never yours. What stays weaker than managed settings:

- A worker cannot change the flags it was launched with, but a list setting from the worktree's
  settings files (an extra `permissions.allow`, say) is merged with ours, not replaced. The sandbox
  and the `Edit` rules keep the worker from writing those files, so this needs a human to do it.
- `--settings` is a file in `.vha/hooks/` that the bot rewrites each turn, outside the sandbox, and
  that the worker may not write. Managed settings are a file only root may write, and no one at
  the machine can launch Claude without them.

On a machine nobody else uses Claude Code on, install the same settings as managed settings, where
nothing a worker or a worktree contains can override them:

    bash host/setup.sh --managed-settings     # or --dedicated, which also sets power options

It renders `host/sandbox-settings.sh --managed` into
`/Library/Application Support/ClaudeCode/managed-settings.d/50-vha-bot.json` (asks for sudo), for every
worktree under `BOT_WORKTREES`. **Every Claude Code session on that machine then runs sandboxed and
under those permission rules**, yours included; that is why it is not the default. Re-run it after
moving the checkout or changing `scripts/protected-paths.txt`. To remove it, delete that file.

### The bot's own tests

- The pure TypeScript (the fold, the event schema, the Notion model, the sidebar view, outcomes) is
  tested under `test/unit/bot/`, with fixtures in JSON beside it. They need no database and no
  servers, and `deno task test` runs them with everything else: `deno test -A test/unit/bot` runs just
  them.
- The bash is tested with `bats-core` under `bot/test/` (outside `test/`, so the repo's hygiene rule about
  non-test files in `test/` doesn't apply): `bats -r bot/test`, or one file such as
  `bats bot/test/run.bats`. They stub `claude`, `gh`, `psql` and the rest, run against a throwaway
  `BOT_DIR`, and never touch a real database or Notion. Both sets of tests are protected paths: a card
  cannot edit them.
- The bot's TypeScript runs as `"$BOT_TS" bot/state.ts …` (`bot/lib/run-ts.sh`): `deno run` with read,
  write, env, net and sys, and run only for `git`, `bash`, `open` and `kill`; `--no-prompt`, so a
  permission it lacks is an error and not a prompt a supervisor waits on; `--no-lock`, so a run never
  rewrites `deno.lock`; `--no-check`, since `deno check` is already a gate. It needs the packages in
  `node_modules` (`deno install --allow-scripts`), which `deno task bot:setup` checks.

## Debugging

### Start here

```
deno task bot:status                 # is it running, is any process DOWN, where every card stands
deno task bot:status -- <card>       # one card: state, retries, block reason, ports, databases, the end of its card.log
deno task bot:watch -- <card>        # the card's card.log, live
deno task bot:attach                 # the running workers themselves (C-b w to pick one)
```

**`card.log` holds everything about a card**, in order, one line per entry: `HH:MM:SS <source> │ …`.

| Source                     | What it is                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `event`                    | each of the card's events, in words: started, asked, run finished, PR opened, Notion writes |
| `worker#<n>`               | turn `n`: what was typed to Claude (`›`), what it said, and one line per tool it used       |
| `worker`, `tester`         | the scripts' own output                                                                     |
| `build`, `servers`, `test` | each test run's logs, as they were written                                                  |

Filter it with grep, for example `grep -v servers <worktree>/.vha/card.log`, or `grep 'worker#3'
<worktree>/.vha/card.log`.

### From a Notion card to its files

1. The card id is the 32 hex characters at the end of the card's URL.
2. `deno task bot:status -- <those 32 characters>` prints the worktree path, ports and databases.
3. In the worktree's `.vha/`:
   - `card.log` has the story.
   - `db.log` has the making of its databases.
   - `runs/latest/` (or the run named in a failure comment, such as `20261007-145320-bot-run`) has that
     run's logs: `command.log` is the command's output, `servers.log` the servers' start, `server.log`,
     `proxy.log` and `events.log` the servers' own logs.
   - `checks/<n>.log` has a `done`'s checks.
   - `outcomes/` has what the worker asked for each turn.

### The worker's reasoning

`card.log` has each turn in short form. The full transcript is `.vha/sessions/<n>.jsonl`. `deno task
bot:resume -- <card>` takes you to the card's window while a worker is running ([watching a worker](#watching-a-worker)), and otherwise opens that session in Claude, in the card's worktree;
`<card>` may also be the card's Notion URL. What you say there joins the session the bot resumes next.
To ask the worker about it without changing that session, talk over a copy:

```
deno task bot:resume -- <card> --fork-session
```

### Run something yourself

`deno task bot:test -- <card> -- deno task test test/web/<file>.test.ts` queues a test on the bot's
testers, in the card's worktree, with its ports and databases and a run dir of its own. The card has to
be idle (waiting on you, blocked, finished, or held). The result doesn't change the card's state. The
web servers are started first when the command names `test/web` or is a bare `deno task test`; force it
with `--servers` or `--no-servers`. A worker's `run` does the same, at its branch's last commit.

### The event log

```
deno task bot:watch                                      # every event, live, in words
tail -n 50 .bot/events.jsonl | jq -c .                   # the raw lines
jq -c 'select(.card == "<dashed id>")' .bot/events.jsonl # one card's history
```

If the bot finds a line it can't accept, it stops starting anything and says so in
`.bot/orchestrator.log`, naming the line number. To fix it, stop the bot (`deno task bot:stop`),
correct or remove that line, then start it again. It's the only time the log should be edited by hand.

### Symptoms

| Symptom                                              | Look at                                                    | Usual cause                                                                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing moves                                        | `deno task bot:status`, then `.bot/orchestrator.log`       | The bot isn't running (`bot:start`), a process is DOWN, or the event log has a line it can't accept                                                                             |
| A card stays Queued                                  | `bot:status`                                               | All `BOT_WORKERS` are busy, the bot is paused for a usage limit, the card is held, the Postgres is down, or its worktree couldn't be made (retried each minute; see `card.log`) |
| A card is Blocked as soon as it starts               | its Blocked comment                                        | `dump_missing` or `dump_stale`: make `db/dumps/latest` (and set **Bot state** to **Queued**)                                                                                    |
| A card stays Queued for test run                     | `bot:status`                                               | Every tester is busy (`BOT_TESTERS`)                                                                                                                                            |
| A ticked card is never picked up                     | The card in Notion                                         | Status isn't **Not started**, or **Bot hold** is ticked                                                                                                                         |
| Notion is behind                                     | `bot:status` ("Notion is behind") and `orchestrator.log`   | Notion is unreachable or rate-limited; the writer keeps retrying                                                                                                                |
| A failed run says "the web servers were not healthy" | that run's `servers.log`, `server.log` and `events.log`    | The servers didn't start (a port in use, a build error), or took longer than 300 s                                                                                              |
| A failed run says "uncommitted changes"              | `git status` in the card's worktree                        | Something edited a tracked file after the commit; commit it or drop it                                                                                                          |
| A failed run's proxy log has empty-header 400s       | `proxy.log` in the run                                     | The known bare-400 flake of parallel web tests: rerun the failing files alone                                                                                                   |
| A card stays in Checking                             | the card's `card.log` (`worker`) and `.vha/checks/<n>.log` | A check is slow or hung (its section is written when it ends, or, for one stopped at `CHECKS_CAP_SECONDS`, when they are all stopped)                                           |
| A worker's command says "Operation not permitted"    | the worker's turn in `card.log`                            | The sandbox: it needed a path, host or socket it may not have. If it is a legitimate need, change `host/sandbox-settings.sh` (a protected path: a human does)                   |
| A restore says `transaction_timeout`                 | `.vha/db.log`                                              | `pg_restore` newer than the server and a dump from `pg_dump` 17 or later: harmless, counted as restored                                                                         |
| The bot runs old code                                | `git -C ~/dev/morehumaninternet/vha-bot log -1 --oneline`  | It hasn't been deployed since the merge (`bot:deploy`)                                                                                                                          |
