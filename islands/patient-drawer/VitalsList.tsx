import { useSignal } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
// import { assertHasNonEmptyString } from '../../util/isString.ts'
import { Measurements } from '../../types.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'

// import { FindingsListItem } from './FindingsListItem.tsx'
// import { type Finding, FindingSchema } from './FindingsListItemSchema.ts'

const ADD_VITALS_FINDING_EVENT_NAME = 'add_vitals_finding'
const REMOVE_VITALS_EVENT_NAME = 'remove_vitals_finding'

export function addVitalsFinding(vital: string) {
  self.dispatchEvent(
    new CustomEvent(ADD_VITALS_FINDING_EVENT_NAME, { detail: vital }),
  )
}

export function removeVitalsFinding(vital: string) {
  self.dispatchEvent(
    new CustomEvent(REMOVE_VITALS_EVENT_NAME, { detail: vital }),
  )
}

function VitalsList({ measurements, vitals }: {
  measurements: Partial<Measurements>
  vitals?: Map<string, boolean>
}) {
  const [flaggedVitals, setFlaggedVitals] = useState(
    new Map<string, boolean>(),
  )

  for (const [vital, value] of Object.entries(vitals ?? {})) {
    if (value) {
      setFlaggedVitals((prev) => ({
        ...prev,
        [vital]: true,
      }))
    }
  }

  function onAdd(event: unknown) {
    assert(event instanceof CustomEvent)

    const vital = event.detail as string
    setFlaggedVitals((prev) => ({ ...prev, [vital]: true }))
  }

  function onRemove(event: unknown) {
    assert(event instanceof CustomEvent)
    const vital = event.detail as string

    const prevFlaggedVitals = flaggedVitals
    prevFlaggedVitals.delete(vital)

    setFlaggedVitals(prevFlaggedVitals)
  }

  useEffect(() => {
    addEventListener(ADD_VITALS_FINDING_EVENT_NAME, onAdd)
    addEventListener(REMOVE_VITALS_EVENT_NAME, onRemove)

    return () => {
      removeEventListener(ADD_VITALS_FINDING_EVENT_NAME, onAdd)
      removeEventListener(REMOVE_VITALS_EVENT_NAME, onRemove)
    }
  }, [])

  // TODO: Handle blood pressure as a separate case

  return (
    <div>
      {flaggedVitals.size === 0
        ? <p>No vitals flagged</p>
        : Object.keys(flaggedVitals).map((vital) => (
          <div key={vital}>
            <p>
              {vital}:{' '}
              {measurements[vital as keyof Measurements]![1] + ' ' +
                measurements[vital as keyof Measurements]![2]}
            </p>
          </div>
        ))}
    </div>
  )
}

export default VitalsList
