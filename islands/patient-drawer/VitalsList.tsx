import { useSignal } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { Measurement, Measurements } from '../../types.ts'

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
  measurements: Measurement<keyof Measurements>[]
  vitals: Map<string, boolean>
}) {
  const [flaggedVitals, setFlaggedVitals] = useState<Map<string, boolean>>(
    vitals ?? new Map(),
  )

  useEffect(() => {
    setFlaggedVitals((prevMap) => {
      const newMap = new Map(prevMap)
      measurements.forEach((measurement) => {
        if (measurement.is_flagged) {
          newMap.set(measurement.measurement_name, true)
        }
      })
      return newMap
    })
  }, [measurements])

  function onAdd(event: unknown) {
    assert(event instanceof CustomEvent)

    const vital = event.detail as string

    setFlaggedVitals((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.set(vital, true)
      return newMap
    })
  }

  function onRemove(event: unknown) {
    assert(event instanceof CustomEvent)
    const vital = event.detail as string

    setFlaggedVitals((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.delete(vital)
      return newMap
    })
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
      {flaggedVitals.size === 0 ? <p>No vitals flagged</p> : measurements
        .map((measurement) => (
          flaggedVitals.has(measurement.measurement_name) &&
          (
            <div key={measurement.measurement_name}>
              <p>
                {measurement.measurement_name}:
                {' ' + measurement.value + ' ' + measurement.units}
              </p>
            </div>
          )
        ))}
    </div>
  )
}

export default VitalsList
