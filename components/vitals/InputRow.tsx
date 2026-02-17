import { Maybe, RenderedFindingRelativeToHealthWorker } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Label } from '../../components/library/Label.tsx'
import { LabelSpan } from '../../islands/form/inputs/labelled.tsx'
import { MostRecentRecord } from '../../islands/MostRecentRecord.tsx'
import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export default function VitalsInputRow(
  {
    input,
    name,
    required,
    label,
    most_recent_patient_finding,
    organization_id,
    input_width,
  }: {
    input: ComponentChildren
    most_recent_patient_finding: Maybe<RenderedFindingRelativeToHealthWorker>
    organization_id: string
    required: boolean
    label: string
    name: string
    input_width: string
  },
) {
  return (
    <div className={cls('@container', `vital-input-row-${name}`)}>
      <div className='grid grid-cols-1 @md:grid-cols-[1fr_auto] @md:row-gap-2 @md:grid-rows-[min-content_min-content] w-full'>
        <Label htmlFor={name} className='@md:col-start-1 @md:row-start-1'>
          <LabelSpan
            required={required}
            label={capitalize(label)}
          />
        </Label>
        <div
          className={cls(
            'flex items-center @md:col-start-2 @md:row-start-1 @md:row-span-2 @md:self-stretch',
            input_width,
          )}
        >
          {input}
        </div>
        <MostRecentRecord
          record={most_recent_patient_finding}
          organization_id={organization_id}
          className='@md:col-start-1 @md:row-start-2'
        />
      </div>
    </div>
  )
}
