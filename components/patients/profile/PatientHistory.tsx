import { getSummaryById } from '../../../db/models/patient_intake.ts'
import {
  DescriptionList,
  DescriptionListCellAction,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import { nonEmptyRows } from '../intake/Summary.tsx'

type IntakePatientSummary = Awaited<ReturnType<typeof getSummaryById>>

export default function PatientHistory(
  { patient }: {
    patient: IntakePatientSummary
  },
) {
  const intake_href = `/app/patients/${patient.id}/intake`

  const {
    past_medical_conditions,
    major_surgeries,
  } = patient

  const past_conditions_items: DescriptionListRows[] = past_medical_conditions
    .map(
      (condition, index) =>
        nonEmptyRows([
          [
            {
              value: condition.name,
              name: 'condition',
              href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.name`,
              action: DescriptionListCellAction.View,
            },
          ],
          [
            {
              value: condition.start_date,
              name: 'start_date',
              href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.start_date`,
              action: DescriptionListCellAction.View,
            },
            {
              value: condition.end_date,
              name: 'end_date',
              href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.end_date`,
              action: DescriptionListCellAction.View,
              leading_separator: ' — ',
            },
          ],
        ]),
    )

  const major_surgeries_items: DescriptionListRows[] = major_surgeries.map(
    (surgery, index) =>
      nonEmptyRows([
        [
          {
            value: surgery.name,
            name: 'surgery',
            href: `${intake_href}/history#focus=major_surgeries.${index}.name`,
            action: DescriptionListCellAction.View,
          },
        ],
        [
          {
            value: surgery.start_date,
            name: 'start_date',
            href:
              `${intake_href}/history#focus=major_surgeries.${index}.start_date`,
            action: DescriptionListCellAction.View,
          },
        ],
      ]),
  )

  const pages = [
    {
      title: 'Past Conditions',
      link: `${intake_href}/history`,
      action: DescriptionListCellAction.View,
      items: past_conditions_items,
      sections: [
        {
          title: 'Major Surgeries',
          items: major_surgeries_items,
        },
      ],
    },
  ]

  return <DescriptionList pages={pages} />
}
