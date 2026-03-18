// =============================================================================
// FILE: /islands/tutorial/TutorialOverlay.tsx
// Main tutorial overlay coordinator - handles script-driven navigation
// =============================================================================

import { useEffect } from 'preact/hooks'
import type { ScriptItem, TutorialHashState } from '../../shared/tutorial/types.ts'
import { advance, initialState } from '../../shared/tutorial/state.ts'
import { TutorialDialogue } from './TutorialDialogue.tsx'
import { TutorialSpotlight } from './TutorialSpotlight.tsx'
import { TutorialConfetti } from './TutorialConfetti.tsx'
import { TutorialModal } from './TutorialModal.tsx'
import { assert } from 'std/assert/assert.ts'
import { Maybe } from '../../types.ts'

type Props = {
  script: ScriptItem[]
  item: Maybe<ScriptItem>
  hash_state: TutorialHashState | { action: 'none' }
  setHashState: (state: TutorialHashState | { action: 'none' }) => void
}

/**
 * Main tutorial overlay - renders current script item based on state.
 * Handles all script item types:
 * - dialogue: Speech bubble with optional highlight
 * - highlight: Spotlight element, auto-advance
 * - wait_click: Wait for user to click target
 * - step_transition: Handled by state.advance()
 */
export function TutorialOverlay({ script, item, hash_state, setHashState }: Props) {
  // No item = tutorial not started
  if (!item) return null
  assert(hash_state.action !== 'none')

  // Skip step_transition items (handled by advance function)
  if (item.type === 'step_transition') {
    // This shouldn't render, advance() should skip these
    return null
  }

  const handleAdvance = () => {
    // Close any open HeadlessUI popovers before advancing.
    // Synthetic events have isTrusted=false which HeadlessUI ignores, so instead we
    // find open PopoverButtons by their aria-expanded state and call .click() to toggle them closed.
    const click_target_on_advance = item.click_target_on_advance && document.querySelectorAll<HTMLElement>(item.click_target_on_advance)
    if (click_target_on_advance) click_target_on_advance.forEach(el => el.click())

    item.onLeave?.()

    const next = advance(hash_state, script)
    if (!next) {
      // Tutorial complete - clear hash
      return setHashState({ action: 'none' })
    }

    setHashState(next)
  }

  const handleRestart = () => {
    setHashState(initialState())
  }

  // Check if this is the final step
  const is_final = item.type === 'dialogue' && item.is_final

  return (
    <>
      {is_final && <TutorialConfetti />}
      <RenderItem
        item={item}
        onNext={is_final ? handleRestart : handleAdvance}
        button_text={is_final ? 'Restart Tutorial' : 'Next'}
      />
    </>
  )
}

function handleInput({ field, value }: {
  field: string
  value: string
}) {
  const el = document.querySelector<HTMLElement>(field)
  assert(el, `No element found matching selector ${field}`)
  if (el instanceof HTMLSelectElement) {
    el.value = value
    return el.dispatchEvent(new Event('change', { bubbles: true }))
  }

  // If the element is a radio input (or contains one), click it
  const radio = el instanceof HTMLInputElement && el.type === 'radio'
    ? el
    : el.querySelector<HTMLInputElement>('input[type="radio"]')
  if (radio) {
    return radio.click()
  }

  const native_setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  native_setter?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Render a single script item based on its type.
 */
function RenderItem({
  item,
  onNext,
  button_text,
}: {
  item: Exclude<ScriptItem, { type: 'step_transition' }>
  onNext: () => void
  button_text: string
}) {
  useEffect(() => {
    item.onArrive?.()
  }, [item])

  useEffect(() => {
    if (!item.input) return
    const inputs = [item.input].flat()
    inputs.forEach(handleInput)
  })

  switch (item.type) {
    case 'dialogue':
      return (
        <DialogueRenderer
          item={item}
          onNext={onNext}
          button_text={button_text}
        />
      )

    case 'highlight':
      return (
        <HighlightRenderer
          item={item}
          onNext={onNext}
        />
      )

    case 'wait_click':
      return (
        <WaitClickRenderer
          item={item}
          onNext={onNext}
        />
      )

    case 'modal':
      return (
        <ModalRenderer
          item={item}
          onNext={onNext}
        />
      )
  }
}

/**
 * Render dialogue item with speaker and optional highlight.
 */
function DialogueRenderer({
  item,
  onNext,
  button_text,
}: {
  item: Extract<ScriptItem, { type: 'dialogue' }>
  onNext: () => void
  button_text: string
}) {
  // When portal=true, clicking the highlighted target also advances the tutorial
  useEffect(() => {
    if (!item.portal || !item.highlight) return
    const selectors = Array.isArray(item.highlight) ? item.highlight : [item.highlight]
    const elements = selectors.flatMap((s) => Array.from(document.querySelectorAll<HTMLElement>(s)))
    const handler = () => setTimeout(onNext, 150)
    elements.forEach((el) => el.addEventListener('click', handler))
    return () => elements.forEach((el) => el.removeEventListener('click', handler))
  }, [item.portal, item.highlight, onNext])

  return (
    <>
      <TutorialSpotlight target={item.highlight} portal={item.portal} />
      <TutorialDialogue
        key={item.speaker}
        speaker={item.speaker}
        text={item.text}
        dangerousHTML={!!item.dangerousHTML}
        onNext={onNext}
        button_text={button_text}
        position={item.position || 'bottom-left'}
        link={item.link}
      />
    </>
  )
}

/**
 * Render highlight item - auto-advances after duration.
 */
function HighlightRenderer({
  item,
  onNext,
}: {
  item: Extract<ScriptItem, { type: 'highlight' }>
  onNext: () => void
}) {
  const duration = item.duration ?? 1500

  useEffect(() => {
    const timer = setTimeout(onNext, duration)
    return () => clearTimeout(timer)
  }, [duration, onNext])

  return <TutorialSpotlight target={item.target} />
}

/**
 * Render wait_click item - waits for user to click target element.
 */
function WaitClickRenderer({
  item,
  onNext,
}: {
  item: Extract<ScriptItem, { type: 'wait_click' }>
  onNext: () => void
}) {
  useEffect(() => {
    const el = document.querySelector(item.target)
    assert(el, `No element found ${item.target}`)

    const handler = () => {
      console.log('weklalkwlkawlek')
      // Small delay to let the UI update
      setTimeout(onNext, 150)
    }

    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [item.target, onNext])

  return (
    <>
      <TutorialSpotlight target={item.target} clickable />
      <TutorialDialogue
        speaker='guide'
        text={item.text ?? 'Complete the action highlighted above to continue.'}
        dangerousHTML={!!item.dangerousHTML}
        position={item.position || 'bottom-left'}
      />
    </>
  )
}

/**
 * Render modal item - centered modal with action button.
 */
function ModalRenderer({
  item,
  onNext,
}: {
  item: Extract<ScriptItem, { type: 'modal' }>
  onNext: () => void
}) {
  return (
    <TutorialModal
      message={item.message}
      button_text={item.buttonText}
      onAction={onNext}
    />
  )
}
