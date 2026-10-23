// The bot's sidebar (docs/bot.md#the-sidebar): every live card, what is running on it and for how
// long, redrawn every second in a pane down the left of the bot's tmux session. A click on a card
// shows what is running on it, or talks to its idle worker (bot/sidebar.sh show), a click on
// "notion ↗" opens its card;
// bot/sidebar.sh place keeps the pane in whichever window you are on.
//   sidebar.ts     (BOT_DIR and BOT_CODE set; bot/lib/tmux.sh starts it)
import { existsSync } from 'std/fs/exists.ts'
import { assert } from 'std/assert/assert.ts'
import { join } from 'std/path/join.ts'

import { loadWorld } from './eventLog.ts'
import type { World } from './fold.ts'
import { writeOut } from './io.ts'
import { type Bot, type Line, sidebarLines, type Span, type Target } from './sidebarView.ts'

const BOT_DIR = Deno.env.get('BOT_DIR')
const BOT_CODE = Deno.env.get('BOT_CODE')
assert(BOT_DIR, 'BOT_DIR is unset (bot/lib/bot.sh sets it)')
assert(BOT_CODE, 'BOT_CODE is unset (bot/lib/tmux.sh sets it)')
const EVENTS = join(BOT_DIR, 'events.jsonl')
const PROCESSES = join(BOT_DIR, 'processes.json')
const SIDEBAR_SH = join(BOT_CODE, 'bot', 'sidebar.sh')
const MESSAGE_MS = 8000

const ESC = '\u001b'
/** Its own screen, no cursor, no wrapping (a wide character would push a row onto the next), mouse reports. */
const SCREEN_ON = `${ESC}[?1049h${ESC}[?25l${ESC}[?7l${ESC}[?1000h${ESC}[?1006h`
const SCREEN_OFF = `${ESC}[?1006l${ESC}[?1000l${ESC}[?7h${ESC}[?25h${ESC}[?1049l`
/** An SGR mouse report: button, column and row (1-based), M for a press. */
const MOUSE = new RegExp(`${ESC}\\[<(\\d+);(\\d+);(\\d+)([Mm])`, 'g')
const WHEEL_UP = 64
const WHEEL_DOWN = 65
/** Shift, meta and ctrl (4, 8, 16) still make a click; motion (32) and the wheel (64) do not. */
const isClick = (button: number) => (button & ~(4 | 8 | 16)) === 0

type Processes = { name: string; pid: number | null; gaveUp: boolean }[]

let world: World | null = null
let worldError: string | null = null
let eventsSeen = ''
let bot: Bot = { running: false, down: [] }
let lines: Line[] = []
let scroll = 0
let message: { text: string; until: number } | null = null

/** Signal 0, which Deno.kill cannot send: whether the process exists. */
const isAlive = (pid: number) => new Deno.Command('kill', { args: ['-0', String(pid)], stdout: 'null', stderr: 'null' }).outputSync().success

/** The fold again, only when the log has changed. A log the fold refuses is shown, not fatal. */
function refreshWorld() {
  const stat = existsSync(EVENTS) ? Deno.statSync(EVENTS) : null
  const seen = stat ? `${stat.size}:${stat.mtime?.getTime()}` : 'none'
  if (seen === eventsSeen) return
  eventsSeen = seen
  try {
    world = loadWorld()
    worldError = null
  } catch (error) {
    worldError = error instanceof Error ? error.message : String(error)
  }
}

/** The orchestrator's children, as it last wrote them; a half-written file keeps the last answer. */
function refreshBot() {
  if (!existsSync(PROCESSES)) {
    bot = { running: false, down: [] }
    return
  }
  try {
    const processes: Processes = JSON.parse(Deno.readTextFileSync(PROCESSES))
    bot = {
      running: processes.some((p) => p.pid !== null && isAlive(p.pid)),
      down: processes.filter((p) => p.gaveUp).map((p) => p.name),
    }
  } catch {
    // jq rewrites it in place; the next second reads it whole.
  }
}

function say(text: string) {
  message = { text, until: Date.now() + MESSAGE_MS }
  draw()
}

function draw() {
  const now = new Date()
  const { columns: width, rows: height } = terminalSize()
  const shown: Line[] = world ? sidebarLines(world, bot, now, width, existsSync) : []
  if (worldError) shown.unshift({ text: `${ESC}[31m ${worldError}${ESC}[0m`, spans: [] })
  if (message && message.until < now.getTime()) message = null
  const footer = message ? [`${ESC}[33m ${message.text.slice(0, width - 1)}${ESC}[0m`] : []
  const rows = height - footer.length
  scroll = Math.max(0, Math.min(scroll, shown.length - rows))
  lines = shown.slice(scroll, scroll + rows)
  const text = [...lines.map((line) => line.text), ...Array(Math.max(0, rows - lines.length)).fill(''), ...footer]
  writeOut(`${ESC}[H${text.map((line) => `${line}${ESC}[K`).join('\r\n')}${ESC}[J`)
}

/** The pane's size; 40 by 24 when stdout is not a terminal. */
function terminalSize() {
  try {
    return Deno.consoleSize()
  } catch {
    return { columns: 40, rows: 24 }
  }
}

function show(target: Target) {
  new Deno.Command('bash', { args: [SIDEBAR_SH, 'show', target.kind, target.card, target.worktree], stdout: 'null', stderr: 'piped' }).output().then(
    ({ success, code, stderr }) => {
      if (!success) say(new TextDecoder().decode(stderr).trim().split('\n').at(-1) || `exit ${code}`)
    },
    (error: Error) => say(error.message),
  )
}

function act(span: Span) {
  if (span.action.kind === 'show') {
    show(span.action.target)
    return
  }
  new Deno.Command('open', { args: [span.action.url], stdout: 'null', stderr: 'null' }).output().then(
    ({ success, code }) => {
      if (!success) say(`open failed: exit ${code}`)
    },
    (error: Error) => say(`open failed: ${error.message}`),
  )
}

function onInput(data: string) {
  if (data === '\u0003') quit()
  for (const [, b, x, y, kind] of data.matchAll(MOUSE)) {
    const button = Number(b)
    if (button === WHEEL_UP) scroll = Math.max(0, scroll - 3)
    else if (button === WHEEL_DOWN) scroll += 3
    else if (kind === 'M' && isClick(button)) {
      const column = Number(x) - 1
      const span = lines[Number(y) - 1]?.spans.find((s) => column >= s.from && column < s.to)
      if (span) act(span)
    }
  }
  draw()
}

function quit() {
  writeOut(SCREEN_OFF)
  Deno.exit(0)
}

function tick() {
  refreshWorld()
  refreshBot()
  draw()
}

async function readInput() {
  for await (const chunk of Deno.stdin.readable.pipeThrough(new TextDecoderStream())) onInput(chunk)
}

writeOut(SCREEN_ON)
Deno.stdin.setRaw(true)
Deno.addSignalListener('SIGWINCH', draw)
Deno.addSignalListener('SIGTERM', quit)
Deno.addSignalListener('SIGHUP', quit)
tick()
setInterval(tick, 1000)
await readInput()
