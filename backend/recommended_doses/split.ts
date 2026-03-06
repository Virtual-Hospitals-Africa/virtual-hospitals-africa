import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { indexOf } from '../../util/indexOf.ts'

const semi_pattern = /(?:;| then )/

function splitSemicolon(dose: string) {
  const dose_parts = dose.split(semi_pattern).map((s) => s.trim().replace('  ', ' ')) || []
  return dose_parts.map(splitParentheticals)

  function splitParentheticals(dose_part: string): { parenthetical: false | string | string[]; rest: string } {
    const open_paren = indexOf(dose_part, '(')
    const close_paren = indexOf(dose_part, ')')
    assertEquals(open_paren === -1, close_paren === -1, `unclosed parenthetical ${dose}`)
    let parenthetical: false | string | string[] = open_paren !== -1 && close_paren !== -1 &&
      dose_part.slice(open_paren + 1, close_paren).trim().replace('  ', ' ')
    let rest = (parenthetical ? dose_part.slice(0, open_paren) + dose_part.slice(close_paren + 1) : dose_part).trim().replace('  ', ' ')
    if (!parenthetical) {
      return { parenthetical, rest }
    }

    while (true) {
      const split_again = splitParentheticals(rest)
      if (!split_again.parenthetical) {
        return { parenthetical, rest }
      }
      parenthetical = [parenthetical as string, split_again.parenthetical as string[]].flat()
      rest = split_again.rest
    }
  }
}

export function splitPartsAndParentheticals(dose: string): Array<{ rest: string; parenthetical: false | string | string[] }> {
  const first_open_paren = indexOf(dose, '(')
  const first_semicolon = indexOf(dose, semi_pattern)
  if (first_semicolon !== -1 && first_open_paren !== -1 && first_semicolon > first_open_paren) {
    const first_close_paren = indexOf(dose, ')')
    if (first_close_paren < first_semicolon) {
      return splitSemicolon(dose)
    }
    const remaining = dose.slice(first_close_paren + 1)
    assert(!remaining.includes(')'), `XX ${dose} kkl ${remaining}`)
    const parenthetical = first_open_paren !== -1 && first_close_paren !== -1 && dose.slice(first_open_paren + 1, first_close_paren).trim().replace('  ', ' ')
    const rest = (parenthetical ? dose.slice(0, first_open_paren) : dose).trim().replace('  ', ' ')
    return [{ parenthetical, rest }]
  }

  return splitSemicolon(dose)
}
