// deno-lint-ignore-file no-irregular-whitespace
import { DescriptionList, DescriptionListCell, DescriptionListCellAction, type DescriptionListRows } from '../../library/DescriptionList.tsx'
import type { Maybe, PatientProfileSummary } from '../../../types.ts'
// import { registrationFrequencyText } from '../../../shared/medication.ts'
// import { international_phone_number } from '../../../util/validators.ts'
// import { dosageDisplay, strengthDisplay } from '../../../shared/medication.ts'
import omit from '../../../util/omit.ts'
import { EncounterReason } from '../../../db.d.ts'

export type MaybeCell = {
  value: Maybe<string>
  name?: string
  href?: string
  action?: 'edit' | 'view'
  leading_separator?: string
}

export function isCell(cell: MaybeCell): cell is DescriptionListCell {
  return !!cell.value
}

// Return all the cells that have a value
export function nonNullableCells(row: MaybeCell[]): DescriptionListCell[] {
  const non_null_row = row.filter(isCell)
  if (non_null_row[0]?.leading_separator) {
    non_null_row[0] = omit(non_null_row[0], ['leading_separator'])
  }
  return non_null_row
}

export function nonEmptyRows(rows: MaybeCell[][]): DescriptionListRows {
  return rows.map(nonNullableCells).filter((row) => row.length)
}

export default function PatientRegistrationSummary(
  { organization_id, patient, this_visit }: {
    organization_id: string
    patient: PatientProfileSummary
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
  },
) {
  const registration_href = `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/registration`

  const {
    personal,
    address,
    nearest_health_care,
    // family,
    // occupation,
    // pre_existing_conditions,
    // past_medical_conditions,
    // major_surgeries,
    // allergies,
  } = patient

  const personal_items: DescriptionListRows[] = [
    nonEmptyRows([
      [{
        value: personal.first_names,
        href: `${registration_href}/personal#focus=first_names`,
        action: DescriptionListCellAction.Edit,
        name: 'first_names',
      }, {
        value: personal.surname,
        href: `${registration_href}/personal#focus=surname`,
        action: DescriptionListCellAction.Edit,
        name: 'surname',
        leading_separator: ' ',
      }, {
        value: personal.preferred_name !== personal.first_names ? `(${personal.preferred_name})` : undefined,
        href: `${registration_href}/personal#focus=preferred_name`,
        action: DescriptionListCellAction.Edit,
        name: 'preferred_name',
        leading_separator: ' ',
      }],
      [{
        value: personal.sex,
        href: `${registration_href}/personal#focus=sex`,
        action: DescriptionListCellAction.Edit,
        name: 'sex',
      }, {
        value: personal.gender,
        href: `${registration_href}/personal#focus=gender`,
        action: DescriptionListCellAction.Edit,
        name: 'gender',
        leading_separator: ' • ',
      }, {
        value: personal.date_of_birth,
        href: `${registration_href}/personal#focus=date_of_birth`,
        action: DescriptionListCellAction.Edit,
        name: 'date_of_birth',
        leading_separator: ' • ',
      }],
      [{
        value: personal.national_id_number,
        href: `${registration_href}/personal#focus=national_id_number`,
        action: DescriptionListCellAction.Edit,
        name: 'national_id_number',
      }],
    ]),
  ]

  const this_visit_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: this_visit.reason,
        href: `${registration_href}/primary_care#focus=reason`,
        action: DescriptionListCellAction.Edit,
        name: 'Reason',
      },
    ], [{
      value: this_visit.notes,
      href: `${registration_href}/primary_care#focus=notes`,
      action: DescriptionListCellAction.Edit,
      name: 'Notes',
    }]]),
  ]

  // [{
  //   value: international_phone_number.nullable().parse(personal.phone_number),
  //   href: `${registration_href}/personal#focus=phone_number`,
  //   action: DescriptionListCellAction.Edit,
  //   name: 'phone_number',
  // }]

  const address_rows = [{
    value: address.street,
    name: 'street',
    href: `${registration_href}/contacts#focus=address.street`,
    action: DescriptionListCellAction.Edit,
  }, {
    value: address.locality,
    href: `${registration_href}/contacts#focus=address.locality`,
    action: DescriptionListCellAction.Edit,
    name: 'Ward',
    leading_separator: ', ',
  }]
  if (
    address.administrative_area_level_1 &&
    (address.administrative_area_level_1 !== address.locality)
  ) {
    address_rows.push({
      value: address.administrative_area_level_1,
      name: 'District',
      href: `${registration_href}/primary_care#focus=address.administrative_area_level_1`,
      action: DescriptionListCellAction.Edit,
      leading_separator: ', ',
    })
  }
  if (
    address.administrative_area_level_2 &&
    (address.administrative_area_level_2 !==
      address.administrative_area_level_1) &&
    (address.administrative_area_level_2 !== address.locality)
  ) {
    address_rows.push({
      value: address.administrative_area_level_2,
      name: 'Province',
      href: `${registration_href}/primary_care#focus=address.administrative_area_level_2`,
      action: DescriptionListCellAction.Edit,
      leading_separator: ', ',
    })
  }

  const address_items: DescriptionListRows[] = [
    nonEmptyRows([address_rows]),
  ]

  const nearest_health_care_items: DescriptionListRows[] = [
    nonEmptyRows([[
      {
        value: nearest_health_care.nearest_organization_name,
        href: `${registration_href}/primary_care#focus=nearest_organization_name`,
        action: DescriptionListCellAction.Edit,
        name: 'Nearest Organization',
      },
    ], [{
      value: nearest_health_care.primary_doctor_name,
      href: `${registration_href}/primary_care#focus=primary_doctor_name`,
      action: DescriptionListCellAction.Edit,
      name: 'Primary Doctor',
    }]]),
  ]

  const pages = [
    {
      title: 'Personal',
      link: `${registration_href}/personal`,
      action: DescriptionListCellAction.Edit,
      items: personal_items,
      sections: [],
    },
    {
      title: 'This Visit',
      link: `${registration_href}/primary_care`,
      action: DescriptionListCellAction.Edit,
      items: this_visit_items,
      sections: [],
    },
    {
      title: 'Primary care',
      link: `${registration_href}/primary_care`,
      action: DescriptionListCellAction.Edit,
      items: nearest_health_care_items,
      sections: [
        // {
        //   title: 'Current insurance',
        //   items: current_insurance_items,
        // },
      ],
    },
    {
      title: 'Contacts',
      link: `${registration_href}/primary_care`,
      action: DescriptionListCellAction.Edit,
      items: address_items,
      sections: [
        // {
        //   title: 'Emergency Contacts',
        //   items: emergency_contacts_items,
        // },
      ],
    },
  ]

  return <DescriptionList pages={pages} />
}
