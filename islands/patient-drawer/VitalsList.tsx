import { useEffect, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { Measurement, Measurements } from '../../types.ts'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import capitalize from '../../util/capitalize.ts'

const ADD_VITALS_FINDING_EVENT_NAME = 'add_vitals_finding'
const REMOVE_VITALS_EVENT_NAME = 'remove_vitals_finding'

export function addVitalsFinding(vitalName: string, vitalValue: number) {
  self.dispatchEvent(
    new CustomEvent(ADD_VITALS_FINDING_EVENT_NAME, {
      detail: {
        vital_name: vitalName,
        vital_value: vitalValue,
      },
    }),
  )
}

export function removeVitalsFinding(vital: string) {
  self.dispatchEvent(
    new CustomEvent(REMOVE_VITALS_EVENT_NAME, { detail: vital }),
  )
}

function VitalsList({ measurements, vitals }: {
  measurements: Measurement<keyof Measurements>[]
  vitals: Map<string, Measurement<keyof Measurements>>
}) {
  const [flaggedVitals, setFlaggedVitals] = useState<
    Map<string, Measurement<keyof Measurements>>
  >(
    vitals ?? new Map(),
  )

  useEffect(() => {
    setFlaggedVitals((prevMap) => {
      const newMap = new Map(prevMap)
      measurements.forEach((measurement) => {
        if (measurement.is_flagged) {
          newMap.set(measurement.measurement_name, measurement)
        }
      })
      return newMap
    })
  }, [measurements])

  function onAdd(event: unknown) {
    assert(event instanceof CustomEvent)

    const vital = event.detail

    console.log('vital', vital)

    setFlaggedVitals((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.set(
        vital.vital_name,
        {
          measurement_name: vital.vital_name,
          is_flagged: true,
          value: vital.vital_value,
          units: MEASUREMENTS[vital.vital_name as keyof Measurements],
        },
      )
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

  return (
    <div>
      {flaggedVitals.size === 0
        ? <p>No vitals flagged</p>
        : Array.from(flaggedVitals.entries()).map(([name, value]) => (
          <div key={name}>
            <p>
              {capitalize(name)}:
              {' ' + value.value + ' ' + value.units}
            </p>
          </div>
        ))}
    </div>
  )
}

export default VitalsList
