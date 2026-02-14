// deno-lint-ignore-file no-irregular-whitespace
import { PatientProfileSummary } from '../../../types.ts'
import { DescriptionList, DescriptionListCellAction, type DescriptionListRows } from '../../library/DescriptionList.tsx'
import { nonEmptyRows } from '../registration/Summary.tsx'

export default function PatientSummary(
  { patient }: {
    patient: PatientProfileSummary
  },
) {
  const registration_href = `/app/patients/${patient.id}/registration`

  const {
    pre_existing_conditions,
  } = patient

  const pre_existing_conditions_items: DescriptionListRows[] = pre_existing_conditions.map(
    (_condition, _index) =>
      nonEmptyRows([
        // [
        //   {
        //     value: condition.name,
        //     name: 'Pre-existing Condition',
        //     href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.name`,
        //     action: DescriptionListCellAction.View,
        //   },
        // ],
        // [
        //   {
        //     value: condition.start_date,
        //     name: 'start_date',
        //     href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.start_date`,
        //     action: DescriptionListCellAction.View,
        //   },
        //   {
        //     value: 'Present',
        //     leading_separator: ' — ',
        //   },
        // ],
      ]),
  )

  const medications_items: DescriptionListRows[] = pre_existing_conditions
    .flatMap((_condition, _index) => [] // condition.medications.map((medication, medIndex) =>
      //   nonEmptyRows([
      //     [
      //       {
      //         value: `${medication.name} (for ${condition.name})`,
      //         name: 'medication',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.name`,
      //         action: DescriptionListCellAction.View,
      //       },
      //     ],
      //     [
      //       {
      //         value: medication.form,
      //         name: 'form',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.form`,
      //         action: DescriptionListCellAction.View,
      //       },
      //     ],
      //     [
      //       {
      //         value: medication.schedules[0].dosage.toString(),
      //         name: 'dosage',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.dosage`,
      //         action: DescriptionListCellAction.View,
      //       },
      //       {
      //         value: medication.strength_numerator_unit,
      //         name: 'strength',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.strength_numerator`,
      //         action: DescriptionListCellAction.View,
      //         leading_separator: ' ',
      //       },
      //       {
      //         value: registrationFrequencyText(
      //           medication.schedules[0].frequency,
      //         ),
      //         name: 'frequency',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.medication_frequency`,
      //         action: DescriptionListCellAction.View,
      //         leading_separator: ' ',
      //       },
      //     ],
      //     [
      //       {
      //         value: medication.start_date,
      //         name: 'start_date',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.start_date`,
      //         action: DescriptionListCellAction.View,
      //       },
      //       {
      //         // TODO get actual end date
      //         value: 'End Date',
      //         name: 'end_date',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.end_date`,
      //         action: DescriptionListCellAction.View,
      //         leading_separator: ' — ',
      //       },
      //     ],
      //     [
      //       {
      //         value: medication.special_instructions,
      //         name: 'special_instructions',
      //         href: `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.special_instructions`,
      //         action: DescriptionListCellAction.View,
      //       },
      //     ],
      //   ])
      // )
    )

  const pages = [
    {
      title: 'Pre-existing Conditions',
      link: `${registration_href}/conditions`,
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
