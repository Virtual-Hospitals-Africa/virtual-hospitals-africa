import { getSummaryById } from '../../../db/models/patient_intake.ts'
import {
  DescriptionList,
  DescriptionListCell,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import type { Maybe } from '../../../types.ts'
import omit from '../../../util/omit.ts'

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
function PhoneDisplay({ phone_number }: { phone_number: string }) {
  return <span>{phone_number}</span>
}

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
  } = patient

  const personal_items: DescriptionListRows[] = [
    nonEmptyRows([[{
      value: personal.name,
      edit_href: `${intake_href}/personal#focus=first_name`,
    }]]),
    nonEmptyRows([[{
      value: personal.phone_number,
      edit_href: `${intake_href}/personal#focus=phone_number`,
    }]]),
  ]

  const address_items: DescriptionListRows[] = [
    nonEmptyRows([[{
      value: address.street,
      edit_href: `${intake_href}/address#focus=address.street`,
    }]]),
    nonEmptyRows([[{
      value: address.locality,
      edit_href: `${intake_href}/address#focus=address.locality`,
    }]]),
    nonEmptyRows([[{
      value: address.administrative_area_level_1,
      edit_href: `${intake_href}/address#focus=address.administrative_area_level_1`,
    }]]),
    nonEmptyRows([[{
      value: address.administrative_area_level_2,
      edit_href: `${intake_href}/address#focus=address.administrative_area_level_2`,
    }]]),
  ]

  const nearest_health_care_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: nearest_health_care.nearest_organization_name,
        edit_href: `${intake_href}/address#focus=nearest_organization_name`,
      },
    ]]),
    nonEmptyRows([[{
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
    ]]),
    nonEmptyRows([[{
      value: patient.family.other_next_of_kin?.relation,
      edit_href: `${intake_href}/family#focus=other_next_of_kin.relation`,
    }]]),
  ]

  const family_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: family.marital_status,
        edit_href: `${intake_href}/family#focus=family.marital_status`,
      },
    ]]),
    nonEmptyRows([[{
      value: family.religion,
      edit_href: `${intake_href}/family#focus=family.religion`,
    }]]),
  ]

  const dependents_items: DescriptionListRows[] = []
  family.dependents.map(
    (dependent, index) => {
      const row1 = nonEmptyRows([
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
      ])
      const row2 = nonEmptyRows([[
        {
          value: dependent.patient_phone_number,
          edit_href:
            `${intake_href}/family#focus=dependents.${index}.patient_phone_number`,
        },
      ]])
      dependents_items.push(row1, row2)
    },
  )

  const pre_existing_conditions_items: DescriptionListRows[] = []

  pre_existing_conditions.map(
    (condition, index) => {
      const row1 = nonEmptyRows([
        [
          {
            value: condition.name,
            edit_href:
              `${intake_href}/conditions#focus=pre_existing_conditions.${index}.name`,
          },
        ],
      ])

      const row2 = nonEmptyRows([[
        {
          value: condition.start_date,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.start_date`,
        }, // Not a cell!
        {
          value: 'Present',
          edit_href: ' ',
          leading_separator: ' - ',
        },
      ]])
      pre_existing_conditions_items.push(row1, row2)
    },
  )

  const medications_items: DescriptionListRows[] = []
  pre_existing_conditions.map((condition, index) =>
    condition.medications.map((medication, medIndex) => {
      const row1 = nonEmptyRows([[
        {
          value: medication.name,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.name`,
        },
      ]])
      const row2 = nonEmptyRows([[
        {
          value: medication.form,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.form`,
        },
      ]])
      const row3 = nonEmptyRows([[
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
          value: medication.schedules[0].frequency,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.frequency`,
          leading_separator: ' ',
        },
      ]])
      const row4 = nonEmptyRows([[
        {
          value: medication.start_date,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.start_date`,
        },
        {
          value: 'End Date',
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.end_date`,
          leading_separator: ' — ',
        },
      ]])
      const row5 = nonEmptyRows([[
        {
          value: medication.special_instructions,
          edit_href:
            `${intake_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.special_instructions`,
        },
      ]])
      medications_items.push(row1, row2, row3, row4, row5)
    })
  )

  const pages = [
    {
      title: 'Personal',
      items: personal_items,
      sections: [],
    },
    {
      title: 'Address',
      items: address_items,
      sections: [
        {
          title: 'Nearest Health Care',
          items: nearest_health_care_items,
        },
      ],
    },
    {
      title: 'Family',
      items: family_items,
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
    },
    {
      title: 'Pre-existing Conditions',
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