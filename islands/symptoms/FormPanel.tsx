import { RightPanel } from '../RightPanel.tsx'
import { SymptomForm } from './Form.tsx'
import { RenderedPatientSymptom } from '../../types.ts'

type SymptomFormPanelProps = {
  show: boolean
  onClose: () => void
  symptom: Partial<RenderedPatientSymptom>
  today: string
}

export function SymptomFormPanel({
  show,
  onClose,
  symptom,
  today,
}: SymptomFormPanelProps) {
  return (
    <RightPanel
      show={show}
      onClose={onClose}
      title={symptom.name || 'Symptom'}
      maxWidth='max-w-4xl'
    >
      <SymptomForm
        symptom={symptom}
        today={today}
      />
    </RightPanel>
  )
}
