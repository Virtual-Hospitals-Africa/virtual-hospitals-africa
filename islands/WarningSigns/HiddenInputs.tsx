import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { ToggleableWarningSign, uniqueIdentifier } from './shared.ts'

export function WarningSignsHiddenInputs({ signs_to_send_to_server }: { signs_to_send_to_server: ToggleableWarningSign[] }) {
  return signs_to_send_to_server.map((sign) => {
    const key = uniqueIdentifier(sign)
    const existence = sign.entered ? 'Yes' : 'No'
    const s_expression = sign.entered?.s_expression || sign.clinical_finding_s_expression

    return (
      <HiddenInput
        key={key}
        name={`warning_signs.${key}`}
        value={{
          existence,
          s_expression,
          warning_sign_key: sign.key,
          priority_level: sign.entered?.priority || sign.priority,
          existing_record: sign.existing_record && {
            id: sign.existing_record.id,
            // altered if existence differs or the s_expressions differ
            // "No" existence falls back to clinical_finding_s_expression in both cases so will be unaltered
            altered: sign.existing_record.existence !== existence || (
              s_expression !== (sign.existing_record.augmented?.s_expression ?? sign.clinical_finding_s_expression)
            ),
          },
        }}
      />
    )
  })
}
