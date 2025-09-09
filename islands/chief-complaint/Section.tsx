import { HeroIconButton } from '../../components/library/HeroIconButton.tsx'
import { MicrophoneIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { Iso6392BLanguages } from '../../db.d.ts'
import { TextArea } from '../form/Inputs.tsx'

export function ChiefComplaintSection({
  patient_chief_complaint,
  languages,
}: {
  patient_chief_complaints: unknown
  languages: Iso6392BLanguages[]
}) {
  const display_record_audio_dialog = useSignal(false)

  return (
    <div>
      Chief Complaint
      <HeroIconButton
        variant='outline'
        color='blue'
        type='button'
        title='Record Chief Complaint'
        className='w-8 h-8'
        onClick={() => display_record_audio_dialog.value = true}
      >
        <MicrophoneIcon className='h-4 w-4' />
      </HeroIconButton>

      <TextArea name='chief_complaint' label='Chief Complaint' />
    </div>
  )
}
