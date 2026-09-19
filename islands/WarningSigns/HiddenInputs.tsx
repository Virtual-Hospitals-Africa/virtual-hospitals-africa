import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { TriageWarningSignsPostBody } from '../../shared/warning_signs_post.ts'

export function WarningSignsHiddenInputs({ form_values }: { form_values: TriageWarningSignsPostBody }) {
  return <HiddenInput value={form_values} />
}
