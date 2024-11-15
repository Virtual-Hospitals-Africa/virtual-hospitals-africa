import { getSummaryById } from '../../../db/models/patient_intake.ts'
import {
  DescriptionList,
  DescriptionListCellAction,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import { intakeFrequencyText } from '../../../shared/medication.ts'
import { nonEmptyRows } from '../intake/Summary.tsx'

type IntakePatientSummary = Awaited<ReturnType<typeof getSummaryById>>

export default function PatientSummary(
  { patient }: {
    patient: IntakePatientSummary
  },
) {
  const intake_href = `/app/patients/${patient.id}/intake`

  const {
    pre_existing_conditions,
  } = patient

  const pre_existing_conditions_items: DescriptionListRows[] =
    pre_existing_conditions.map(
      (condition, index) =>
        nonEmptyRows([
          [
            {
              value: condition.name,
              name: 'Pre-existing Condition',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.name`,
              action: DescriptionListCellAction.View,
            },
          ],
          [
            {
              value: condition.start_date,
              name: 'start_date',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.start_date`,
              action: DescriptionListCellAction.View,
            },
            {
              value: 'Present',
              leading_separator: ' — ',
            },
          ],
        ]),
    )

  const medications_items: DescriptionListRows[] = pre_existing_conditions
    .flatMap((condition, index) =>
      condition.medications.map((medication, medIndex) =>
        nonEmptyRows([
          [
            {
              value: `${medication.name} (for ${condition.name})`,
              name: 'medication',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.name`,
              action: DescriptionListCellAction.View,
            },
          ],
          [
            {
              value: medication.form,
              name: 'form',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.form`,
              action: DescriptionListCellAction.View,
            },
          ],
          [
            {
              value: medication.schedules[0].dosage.toString(),
              name: 'dosage',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.dosage`,
              action: DescriptionListCellAction.View,
            },
            {
              value: medication.strength_numerator_unit,
              name: 'strength',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.strength_numerator`,
              action: DescriptionListCellAction.View,
              leading_separator: ' ',
            },
            {
              value: intakeFrequencyText(medication.schedules[0].frequency),
              name: 'frequency',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.intake_frequency`,
              action: DescriptionListCellAction.View,
              leading_separator: ' ',
            },
          ],
          [
            {
              value: medication.start_date,
              name: 'start_date',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.start_date`,
              action: DescriptionListCellAction.View,
            },
            {
              // TODO get actual end date
              value: 'End Date',
              name: 'end_date',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.end_date`,
              action: DescriptionListCellAction.View,
              leading_separator: ' — ',
            },
          ],
          [
            {
              value: medication.special_instructions,
              name: 'special_instructions',
              href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.special_instructions`,
              action: DescriptionListCellAction.View,
            },
          ],
        ])
      )
    )

  const pages = [
    {
      title: 'Pre-existing Conditions',
      link: `${intake_href}/conditions`,
      action: DescriptionListCellAction.View,
      items: pre_existing_conditions_items,
      sections: [
        {
          title: 'Medications',
          items: medications_items,
        },
      ],
    },
  ]

  return <DescriptionList pages={pages} />
}
