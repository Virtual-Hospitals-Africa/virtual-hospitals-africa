

import { Signal, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'
import { Measurements } from '../../types.ts'

// import { FindingsListItem } from './FindingsListItem.tsx'
// import { type Finding, FindingSchema } from './FindingsListItemSchema.ts'

const ADD_VITALS_FINDING_EVENT_NAME = 'add_vitals_finding'
const REMOVE_VITALS_EVENT_NAME = 'remove_vitals_finding'

export function addVitalsFinding(vital: string) {
    // Check if vital exists in Measurements object
    assertHasNonEmptyString(vital, 'vital')

    // Check if vital exists in Measurements object
    assert(vital as keyof Measurements, `Vital ${vital} does not exist in Measurements object`)

    // self.dispatchEvent(
    //     // new CustomEvent(ADD_VITALS_FINDING_EVENT_NAME, { detail: finding }),
    // )
}

function VitalsList( {measurements}: {
    measurements: Partial<Measurements>,
}
) {
    // This is a list of vitals that have been flagged by vitals name
    // OnAdd and OnRemove, we update this list
    const flaggedVitals = useSignal<string[]>([
        // 'height',
        // 'weight',
    ])

    // function onAdd(event: unknown) {
    //     assert(event instanceof CustomEvent)

    //     const vital = event.detail as string
    //     flaggedVitals.value = [...flaggedVitals.value, vital]
    // }

    // function onRemove(event: unknown) {
    //     assert(event instanceof CustomEvent)
    //     assertHasNonEmptyString(event.detail, 'vital')

    //     const vital = event.detail.vital
    //     flaggedVitals.value = flaggedVitals.value.filter((v) => v == vital)
    // }

    console.log('measurements', measurements)
    console.log('flaggedVitals', flaggedVitals.value)

    return (
        <div>
            {Object.keys(flaggedVitals.value).length === 0 ?
                <p>No vitals flagged</p> :
                flaggedVitals.value.map((vital) => (
                    <p>{vital} : {measurements[vital as keyof Measurements]![1] + ' ' + measurements[vital as keyof Measurements]![2]}</p>
                ))
            }
        </div>
    )
}

export default VitalsList