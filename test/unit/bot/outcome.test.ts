import { join } from 'std/path/join.ts'
import { beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertMatch } from 'std/assert/assert_match.ts'

import { checkOutcome, needsServers } from '../../../bot/outcome.ts'

let worktree: string
let file: string

const check = (content: string) => {
  writeText(file, content)
  return checkOutcome(file, worktree)
}
const kindOf = (content: string) => {
  const checked = check(content)
  return checked.ok ? checked.outcome.kind : `invalid: ${checked.why}`
}
const whyOf = (content: string) => {
  const checked = check(content)
  return checked.ok ? 'valid' : checked.why
}

function git(...args: string[]) {
  const { success, stderr } = new Deno.Command('git', { args: ['-C', worktree, '-c', 'user.email=t@t', '-c', 'user.name=t', ...args] }).outputSync()
  if (!success) throw new Error(`git ${args.join(' ')} failed: ${new TextDecoder().decode(stderr)}`)
}

const writeText = (path: string, content: string) => Deno.writeTextFileSync(path, content)

beforeEach(() => {
  worktree = Deno.makeTempDirSync({ prefix: 'outcome-' })
  Deno.mkdirSync(join(worktree, '.vha'))
  file = join(worktree, '.vha', 'outcome.json')
  writeText(join(worktree, 'a.png'), '')
  writeText(join(worktree, '.gitignore'), '.vha/\n')
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'init')
})

describe('checkOutcome', () => {
  it('needs a committed tree for a run or a done, not for an ask', () => {
    const run = '{"kind":"run","command":"deno task test test/web/a.test.ts"}'
    assertEquals(whyOf(run), 'valid')
    writeText(join(worktree, 'wip.ts'), 'x')
    assertEquals(whyOf(run), 'commit your changes before a run or done outcome (uncommitted: wip.ts)')
    assertEquals(whyOf('{"kind":"done","summary":"s","prTitle":"t","prBody":"b"}'), 'commit your changes before a run or done outcome (uncommitted: wip.ts)')
    assertEquals(whyOf('{"kind":"ask","comment":"q?"}'), 'valid')
  })

  it('accepts each kind', () => {
    assertEquals(kindOf('{"kind":"ask","comment":"Which colour?","attachments":["a.png"]}'), 'ask')
    assertEquals(kindOf('{"kind":"run","command":"deno task test test/web/a.test.ts","why":"see it"}'), 'run')
    assertEquals(kindOf('{"kind":"run","servers":false,"command":"deno task test test/models/a.test.ts"}'), 'run')
    assertEquals(kindOf('{"kind":"done","summary":"s","prTitle":"t","prBody":"b"}'), 'done')
    assertEquals(kindOf('{"kind":"blocked","reason":"r"}'), 'blocked')
  })

  it('says why it rejects one', () => {
    assertMatch(whyOf('not json'), /not JSON/)
    assertMatch(whyOf('{"kind":"ship"}'), /kind/)
    assertMatch(whyOf('{"kind":"run","devices":1,"command":"c"}'), /devices/)
    assertMatch(whyOf('{"kind":"run","servers":"yes","command":"c"}'), /servers/)
    assertMatch(whyOf('{"kind":"ask","comment":"  "}'), /comment/)
    assertMatch(whyOf('{"kind":"ask","comment":"q","attachments":[1]}'), /attachments/)
    assertMatch(whyOf('{"kind":"done","summary":"s","prTitle":"t","prBody":"b","demo":{"name":"school-step"}}'), /demo/)
    assertMatch(whyOf('{"kind":"done","summary":"s","prBody":"b"}'), /prTitle/)
    assertMatch(whyOf('{"kind":"blocked","reason":"r","extra":1}'), /extra/)
    assertMatch(whyOf('[1,2]'), /kind|object/)
  })

  it('rejects a missing file', () => {
    assertEquals(checkOutcome(join(worktree, 'none.json'), worktree), { ok: false, why: 'no .vha/outcome.json was written' })
  })

  it('rejects an attachment outside the worktree, or one that is not there', () => {
    assertMatch(whyOf('{"kind":"ask","comment":"q","attachments":["../../etc/hosts"]}'), /inside the worktree/)
    assertMatch(whyOf('{"kind":"ask","comment":"q","attachments":["missing.png"]}'), /inside the worktree/)
  })
})

describe('needsServers', () => {
  it('is what the worker said, whatever the command', () => {
    assertEquals(needsServers('deno task test test/web/a.test.ts', false), false)
    assertEquals(needsServers('deno task test test/models/a.test.ts', true), true)
  })

  it('is true for a command that names test/web, or a bare `deno task test`, which runs every test', () => {
    assertEquals(needsServers('deno task test test/web/patients/open_encounter'), true)
    assertEquals(needsServers('deno task test --use-build test/web'), true)
    assertEquals(needsServers('deno task test ./test/web/a.test.ts'), true)
    assertEquals(needsServers('deno task test'), true)
    assertEquals(needsServers('deno task test --use-build'), true)
  })

  it('is false for the rest, and for a run that ignores test/web', () => {
    assertEquals(needsServers('deno task test --ignore=test/web'), false)
    assertEquals(needsServers('deno task test test/models/Patients.test.ts'), false)
    assertEquals(needsServers('deno check'), false)
  })
})
