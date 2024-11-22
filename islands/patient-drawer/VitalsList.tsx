

import { Signal, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import { assertHasNonEmptyString } from '../../util/isString.ts'
import { Measurements } from '../../types.ts'

// import { FindingsListItem } from './FindingsListItem.tsx'
// import { type Finding, FindingSchema } from './FindingsListItemSchema.ts'

const ADD_VITALS_FINDING_EVENT_NAME = 'add_vitals_finding'
const REMOVE_VITALS_EVENT_NAME = 'remove_vitals_finding'

// export function addVitalsFinding(vital: Partial<Measurements>) {
//     // self.dispatchEvent(
//     //     // new CustomEvent(ADD_VITALS_FINDING_EVENT_NAME, { detail: finding }),
//     // )
// }

function VitalsList( {measurements}: {
    measurements: Partial<Measurements>,
}
) {
    // This is a list of vitals that have been flagged by vitals name
    // OnAdd and OnRemove, we update this list
    const flaggedVitals = useSignal<string[]>([])

    return (
        <div>
            {Object.keys(flaggedVitals.value).length === 0 ?
                ('No vitals flagged yet') :
                (
                    <ul>
                        {Object.entries(measurements).map(([name, value]) => {
                            flaggedVitals.value.includes(name) ?
                                <li>
                                    {name}: {value}
                                </li>
                                : null
                        })}
                    </ul>
                )
            }
        </div>
    )
}

export default VitalsList