// =============================================================================
// FILE: /islands/tutorial/TutorialOverlay.tsx
// Main tutorial overlay coordinator - handles script-driven navigation
// =============================================================================

import { useEffect } from 'preact/hooks'
import type { ScriptItem, TutorialHashState } from '../../shared/tutorial/types.ts'
import { advance, getItem, initialState, parseIndex } from '../../shared/tutorial/state.ts'
import { TutorialDialogue } from './TutorialDialogue.tsx'
import { TutorialSpotlight } from './TutorialSpotlight.tsx'
import { TutorialConfetti } from './TutorialConfetti.tsx'
import { TutorialModal } from './TutorialModal.tsx'

type Props = {
  script: ScriptItem[]
  hashState: TutorialHashState | { action: 'none' }
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
export function TutorialOverlay({ script, hashState, setHashState }: Props) {
  // No hash = tutorial not started
  if (hashState.action === 'none') return null

  const state = hashState as TutorialHashState
  const index = parseIndex(state)
  const item = getItem(index, script)

  // Past end = tutorial complete
  if (!item) return null

  // Skip step_transition items (handled by advance function)
  if (item.type === 'step_transition') {
    // This shouldn't render, advance() should skip these
    return null
  }

  const handleAdvance = () => {
    const next = advance(state, script)
    if (next !== null) {
      setHashState(next)
    } else {
      // Tutorial complete - clear hash
      setHashState({ action: 'none' })
    }
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
  return (
    <>
      <TutorialSpotlight target={item.highlight} />
      <TutorialDialogue
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
    if (!el) return

    const handler = () => {
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
