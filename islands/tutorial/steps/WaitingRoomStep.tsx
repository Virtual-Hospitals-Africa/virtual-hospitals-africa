// =============================================================================
// FILE: /islands/tutorial/steps/WaitingRoomStep.tsx
// Waiting room step for tutorial - shows Open Encounters view
// =============================================================================

import { TUTORIAL_WAITING_ROOM } from '../../../shared/tutorial/mock-data.ts'
import WaitingRoomView from '../../../components/waiting_room/View.tsx'

/**
 * Waiting room step - displays the Open Encounters table with mock patients.
 * This is the starting point of the tutorial.
 */
export function WaitingRoomStep() {
  return (
    <div data-tutorial='waiting-room-table'>
      <WaitingRoomView
        waiting_room={TUTORIAL_WAITING_ROOM}
        organization_id='tutorial-org'
        can_register_patients={false}
      />
    </div>
  )
}
