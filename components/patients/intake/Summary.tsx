import { getSummaryById } from '../../../db/models/patient_intake.ts'
import {
  DescriptionList,
  DescriptionListCell,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import type { Maybe } from '../../../types.ts'
import omit from '../../../util/omit.ts'
import { intakeFrequencyText } from '../../../shared/medication.ts'
import { parsePhoneNumber } from 'npm:awesome-phonenumber'
import { international_phone_number } from '../../../util/validators.ts'

type IntakePatientSummary = Awaited<ReturnType<typeof getSummaryById>>

/*
  - [ ] Make each cell editable (link)
  - [ ] Handle null values in rows/cells
  - [ ] Handle medications (include end date)
  - [ ] Get everything type-checking
  - [ ] Refactor pages to be their own functions (one for each page)
  - [ ] One edit icon per row, not per cell
*/

// TODO Do something for displaying international phone numbers
// function PhoneDisplay({ phone_number }: { phone_number: string }) {
//   return <span>{phone_number}</span>
// }

type MaybeCell = {
  value: Maybe<string>
  edit_href?: string
  leading_separator?: string
}

function isCell(cell: MaybeCell): cell is DescriptionListCell {
  return !!cell.value
}

// Return all the cells that have a value
function nonNullableCells(row: MaybeCell[]): DescriptionListCell[] {
  const non_null_row = row.filter(isCell)
  if (non_null_row[0]?.leading_separator) {
    non_null_row[0] = omit(non_null_row[0], ['leading_separator'])
  }
  return non_null_row
}

function nonEmptyRows(rows: MaybeCell[][]): DescriptionListRows {
  return rows.map(nonNullableCells).filter((row) => row.length)
}

export default function PatientSummary(
  { patient }: {
    patient: IntakePatientSummary
  },
) {
  const intake_href = `/app/patients/${patient.id}/intake`

  const {
    personal,
    address,
    nearest_health_care,
    family,
    pre_existing_conditions,
    past_medical_conditions,
    major_surgeries,
  } = patient

  const personal_items: DescriptionListRows[] = [
    nonEmptyRows([[{
      value: personal.name,
      edit_href: `${intake_href}/personal#focus=first_name`,
    }], [{
      value: international_phone_number.nullable().parse(personal.phone_number),
      edit_href: `${intake_href}/personal#focus=phone_number`,
    }]]),
  ]

  const address_items: DescriptionListRows[] = [
    nonEmptyRows([[{
      value: address.street,
      edit_href: `${intake_href}/address#focus=address.street`,
    }], [{
      value: address.locality,
      edit_href: `${intake_href}/address#focus=address.locality`,
    }], [{
      value: address.administrative_area_level_1,
      edit_href:
        `${intake_href}/address#focus=address.administrative_area_level_1`,
    }], [{
      value: address.administrative_area_level_2,
      edit_href:
        `${intake_href}/address#focus=address.administrative_area_level_2`,
    }]]),
  ]

  const nearest_health_care_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: nearest_health_care.nearest_organization_name,
        edit_href: `${intake_href}/address#focus=nearest_organization_name`,
      },
    ], [{
      value: nearest_health_care.primary_doctor_name,
      edit_href: `${intake_href}/address#focus=primary_doctor_name`,
    }]]),
  ]

  const next_of_kin_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: patient.family.other_next_of_kin?.patient_name,
        edit_href: `${intake_href}/family#focus=other_next_of_kin.patient_name`,
      },
      {
        value: patient.family.other_next_of_kin?.relation,
        edit_href: `${intake_href}/family#focus=other_next_of_kin.relation`,
        leading_separator: ', ',
      },
    ]]),
  ]

  console.log('next_of_kin_items', next_of_kin_items)

  const family_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: family.marital_status,
        edit_href: `${intake_href}/family#focus=family.marital_status`,
      },
      {
        value: family.religion,
        edit_href: `${intake_href}/family#focus=family.religion`,
      },
    ]]),
  ]

  const dependents_items: DescriptionListRows[] = family.dependents.map(
    (dependent, index) =>
      nonEmptyRows([
        [{
          value: dependent.patient_name,
          edit_href:
            `${intake_href}/family#focus=dependents.${index}.patient_name`,
        }, {
          value: dependent.family_relation_gendered,
          edit_href:
            `${intake_href}/family#focus=dependents.${index}.family_relation_gendered`,
          leading_separator: ', ',
        }],
        [
          {
            value: international_phone_number.nullable().parse(
              dependent.patient_phone_number,
            ),
            edit_href:
              `${intake_href}/family#focus=dependents.${index}.patient_phone_number`,
          },
        ],
      ]),
  )

  const guardians_items: DescriptionListRows[] = family.guardians.map(
    (guardian, index) =>
      nonEmptyRows([
        [{
          value: guardian.patient_name,
          edit_href:
            `${intake_href}/family#focus=guardians.${index}.patient_name`,
        }, {
          value: guardian.family_relation_gendered,
          edit_href:
            `${intake_href}/family#focus=guardians.${index}.family_relation_gendered`,
          leading_separator: ', ',
        }],
        [{
          value: international_phone_number.nullable().parse(
            guardian.patient_phone_number,
          ),
          edit_href:
            `${intake_href}/family#focus=guardians.${index}.patient_phone_number`,
        }],
      ]),
  )

  const past_conditions_items: DescriptionListRows[] = past_medical_conditions
    .map(
      (condition, index) =>
        nonEmptyRows([
          [
            {
              value: condition.name,
              edit_href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.name`,
            },
          ],
          [
            {
              value: condition.start_date,
              edit_href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.start_date`,
            },
            {
              value: condition.end_date,
              edit_href:
                `${intake_href}/history#focus=past_medical_conditions.${index}.end_date`,
              leading_separator: ' — ',
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
            edit_href:
              `${intake_href}/history#focus=major_surgeries.${index}.name`,
          },
        ],
        [
          {
            value: surgery.start_date,
            edit_href:
              `${intake_href}/history#focus=major_surgeries.${index}.start_date`,
          },
        ],
      ]),
  )

  const pre_existing_conditions_items: DescriptionListRows[] =
    pre_existing_conditions.map(
      (condition, index) =>
        nonEmptyRows([
          [
            {
              value: condition.name,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.name`,
            },
          ],
          [
            {
              value: condition.start_date,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.start_date`,
            },
            {
              value: ' — Present',
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
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.name`,
            },
          ],
          [
            {
              value: medication.form,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.form`,
            },
          ],
          [
            {
              value: medication.schedules[0].dosage.toString(),
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.dosage`,
            },
            {
              value: medication.strength_numerator_unit,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.strength_numerator`,
              leading_separator: ' ',
            },
            {
              value: intakeFrequencyText(medication.schedules[0].frequency),
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.intake_frequency`,
              leading_separator: ' ',
            },
          ],
          [
            {
              value: medication.start_date,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.start_date`,
            },
            {
              // TODO get actual end date
              value: 'End Date',
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.end_date`,
              leading_separator: ' — ',
            },
          ],
          [
            {
              value: medication.special_instructions,
              edit_href:
                `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.special_instructions`,
            },
          ],
        ])
      )
    )

  const family_page =
    (patient.age.age_years < 18 && patient.family.dependents.length > 0)
      ? {
        title: 'Family',
        link: `${intake_href}/family`,
        items: family_items,
        sections: [
          {
            title: 'Guardians',
            items: guardians_items,
          },
          {
            title: 'Dependents',
            items: dependents_items,
          },
        ],
      }
      : (patient.age.age_years < 18 && patient.family.dependents.length === 0)
      ? {
        title: 'Family',
        items: family_items,
        link: `${intake_href}/family`,
        sections: [
          {
            title: 'Guardians',
            items: guardians_items,
          },
        ],
      }
      : {
        title: 'Family',
        items: family_items,
        link: `${intake_href}/family`,
        sections: [
          {
            title: 'Next of kin',
            items: next_of_kin_items,
          },
          {
            title: 'Dependents',
            items: dependents_items,
          },
        ],
      }

  const pages = [
    {
      title: 'Personal',
      link: `${intake_href}/personal`,
      items: personal_items,
      sections: [],
    },
    {
      title: 'Address',
      link: `${intake_href}/address`,
      items: address_items,
      sections: [
        {
          title: 'Nearest Health Care',
          items: nearest_health_care_items,
        },
      ],
    },
    family_page,
    {
      title: 'Pre-existing Conditions',
      link: `${intake_href}/conditions`,
      items: pre_existing_conditions_items,
      sections: [
        {
          title: 'Medications',
          items: medications_items,
        },
      ],
    },
    {
      title: 'Past Conditions',
      link: `${intake_href}/history`,
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
