import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import puppeteer, { type Browser, type Page } from 'puppeteer'
import { route } from '../_route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import { CONSULTATION_SCRIPT } from '../../shared/consultation-tutorial/script.ts'
import { delay } from '../../util/delay.ts'

const FINAL_INDEX = CONSULTATION_SCRIPT.length - 1
const FINAL_BUTTON_TEXT = 'Sign Up for Updates'

/*
  The tutorial is entirely client side: every script item lives in the location hash as
  #step=<step>&index=<n>&action=tutorial. Advancing always means the index goes up, so the
  index is what we poll to know a click landed.
*/
type TutorialState = {
  hash: string
  index: number | null
  step: string | null
  /* What the current script item offers as its primary action */
  action:
    | { type: 'next'; button_text: string }
    | { type: 'modal' }
    | { type: 'spotlight'; x: number; y: number; width: number; height: number }
    | { type: 'none' }
}

function readState(page: Page): Promise<TutorialState> {
  return page.evaluate(() => {
    const params = new URLSearchParams(location.hash.slice(1))
    const raw_index = params.get('index')

    const next = document.querySelector<HTMLElement>('button[data-tutorial-action="next"]')
    const modal = document.querySelector<HTMLElement>('button[data-tutorial-action="modal"]')
    /* wait_click items have no button of their own — the user clicks through the amber spotlight cutout */
    const spotlight = Array.from(document.querySelectorAll('svg rect')).find((rect) => rect.getAttribute('stroke') === '#f59e0b')

    return {
      hash: location.hash,
      index: raw_index === null ? null : Number(raw_index),
      step: params.get('step'),
      action: next ? { type: 'next' as const, button_text: next.textContent?.trim() ?? '' } : modal ? { type: 'modal' as const } : spotlight
        ? {
          type: 'spotlight' as const,
          x: Number(spotlight.getAttribute('x')),
          y: Number(spotlight.getAttribute('y')),
          width: Number(spotlight.getAttribute('width')),
          height: Number(spotlight.getAttribute('height')),
        }
        : { type: 'none' as const },
    }
  })
}

function clickPrimaryAction(page: Page, state: TutorialState): Promise<void> {
  switch (state.action.type) {
    case 'next':
      return page.click('button[data-tutorial-action="next"]')
    case 'modal':
      return page.click('button[data-tutorial-action="modal"]')
    case 'spotlight':
      return page.mouse.click(
        state.action.x + state.action.width / 2,
        state.action.y + state.action.height / 2,
      )
    case 'none':
      throw new Error('no primary action to click')
  }
}

/* Poll rather than sleep: most items advance instantly, a few wait on a 150ms handoff */
async function waitForIndexToChange(page: Page, from: number | null): Promise<TutorialState> {
  let state = await readState(page)
  for (let attempt = 0; attempt < 40 && state.index === from; attempt++) {
    await delay(100)
    state = await readState(page)
  }
  return state
}

describe('tutorial-consultation', () => {
  let browser: Browser
  let page: Page
  const page_errors: string[] = []

  before(async () => {
    await waitUntilTestServerUp()
    browser = await puppeteer.launch({
      args: ['--ignore-certificate-errors', '--no-sandbox'],
      headless: true,
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1400, height: 1000 })
    page.on('pageerror', (error) => {
      const { message, stack } = error as Error
      page_errors.push(`${message}\n${stack ?? ''}`)
    })
  })

  afterAll(async () => {
    await browser?.close()
  })

  it('advances through the whole script by clicking the primary action', async () => {
    await page.goto(`${route}/tutorial-consultation`, { waitUntil: 'networkidle2' })

    let state = await waitForIndexToChange(page, null)
    assertEquals(state.index, 0, `tutorial did not start, hash was ${state.hash}`)

    const visited: string[] = []

    /* Every click advances by at least one item, so the script length bounds the loop */
    for (let clicks = 0; clicks <= CONSULTATION_SCRIPT.length; clicks++) {
      visited.push(state.hash)

      if (state.action.type === 'next' && state.action.button_text === FINAL_BUTTON_TEXT) {
        assertEquals(
          state.index,
          FINAL_INDEX,
          `reached the final dialogue at index ${state.index}, expected ${FINAL_INDEX}`,
        )
        return
      }

      assert(
        state.action.type !== 'none',
        `stuck at ${state.hash} with no primary action to click.\n` +
          `visited: ${visited.join(' -> ')}\n` +
          `page errors:\n${page_errors.join('\n') || '(none)'}`,
      )

      const index_before = state.index!
      await clickPrimaryAction(page, state)
      state = await waitForIndexToChange(page, index_before)

      assert(
        state.index !== index_before,
        `clicking the primary action at ${visited.at(-1)} did not advance the tutorial.\n` +
          `visited: ${visited.join(' -> ')}\n` +
          `page errors:\n${page_errors.join('\n') || '(none)'}`,
      )
    }

    throw new Error(`never reached the final script item.\nvisited: ${visited.join(' -> ')}`)
  })

  it('renders every step without a client-side exception', () => {
    assertEquals(page_errors, [], `the tutorial threw while rendering:\n${page_errors.join('\n\n')}`)
  })
})
