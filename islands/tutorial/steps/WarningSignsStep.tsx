// =============================================================================
// FILE: /islands/tutorial/steps/WarningSignsStep.tsx
// Warning signs step wrapper for tutorial
// =============================================================================

import WarningSigns from '../../WarningSigns.tsx'
import { TUTORIAL_WARNING_SIGNS } from '../../../shared/tutorial/mock-data.ts'

/**
 * Warning signs step - wraps the real WarningSigns component
 * with tutorial-specific mock data.
 */
export function WarningSignsStep() {
  return (
    <WarningSigns
      search_route='/tutorial/snomed-warning-signs'
      warning_signs={TUTORIAL_WARNING_SIGNS}
    />
  )
}
