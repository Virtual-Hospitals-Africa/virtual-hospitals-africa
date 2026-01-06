// deno-lint-ignore-file no-irregular-whitespace
import { getSummaryById } from '../../../db/models/patient_registration.ts'
import {
  DescriptionList,
  DescriptionListCell,
  DescriptionListCellAction,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import type { Maybe } from '../../../types.ts'
// import { registrationFrequencyText } from '../../../shared/medication.ts'
// import { international_phone_number } from '../../../util/validators.ts'
// import { dosageDisplay, strengthDisplay } from '../../../shared/medication.ts'
import omit from '../../../util/omit.ts'
import { EncounterReason } from '../../../db.d.ts'

type RegistrationPatientSummary = Awaited<ReturnType<typeof getSummaryById>>

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
    patient: RegistrationPatientSummary
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
  },
) {
  const registration_href =
    `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/registration`

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
        value: personal.preferred_name !== personal.first_names
          ? `(${personal.preferred_name})`
          : undefined,
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
      href:
        `${registration_href}/primary_care#focus=address.administrative_area_level_1`,
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
      href:
        `${registration_href}/primary_care#focus=address.administrative_area_level_2`,
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
        href:
          `${registration_href}/primary_care#focus=nearest_organization_name`,
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

  // const next_of_kin_items: DescriptionListRows[] = [
  //   nonEmptyRows([[
  //     {
  //       value: family.next_of_kin?.patient_name,
  //       href: `${registration_href}/family#focus=next_of_kin.patient_name`,
  //       action: DescriptionListCellAction.Edit,
  //       name: 'Next of Kin',
  //     },
  //     {
  //       value: family.next_of_kin?.relation,
  //       href: `${registration_href}/family#focus=next_of_kin.relation`,
  //       action: DescriptionListCellAction.Edit,
  //       name: 'Relationship',
  //       leading_separator: ', ',
  //     },
  //   ]]),
  // ]

  // const family_items: DescriptionListRows[] = [
  //   nonEmptyRows([[
  //     {
  //       value: family.family_type,
  //       href: `${registration_href}/family#focus=family.family_type`,
  //       action: DescriptionListCellAction.Edit,
  //       name: 'family_type',
  //     },
  //   ], [
  //     {
  //       value: family.marital_status,
  //       href: `${registration_href}/family#focus=family.marital_status`,
  //       action: DescriptionListCellAction.Edit,
  //       name: 'marital_status',
  //     },
  //     {
  //       value: family.religion,
  //       href: `${registration_href}/family#focus=family.religion`,
  //       action: DescriptionListCellAction.Edit,
  //       name: 'religion',
  //       leading_separator: ', ',
  //     },
  //   ]]),
  // ]

  // const dependents_items: DescriptionListRows[] = family.dependents.map(
  //   (dependent, index) =>
  //     nonEmptyRows([
  //       [{
  //         value: dependent.patient_name,
  //         href:
  //           `${registration_href}/family#focus=dependents.${index}.patient_name`,
  //         action: DescriptionListCellAction.Edit,
  //       }, {
  //         value: dependent.family_relation_sexed,
  //         href:
  //           `${registration_href}/family#focus=dependents.${index}.family_relation_sexed`,
  //         action: DescriptionListCellAction.Edit,
  //         leading_separator: ', ',
  //       }],
  //       [
  //         {
  //           value: international_phone_number.nullable().parse(
  //             dependent.patient_phone_number,
  //           ),
  //           href:
  //             `${registration_href}/family#focus=dependents.${index}.patient_phone_number`,
  //           action: DescriptionListCellAction.Edit,
  //         },
  //       ],
  //     ]),
  // )

  // const guardians_items: DescriptionListRows[] = family.guardians.map(
  //   (guardian, index) =>
  //     nonEmptyRows([
  //       [{
  //         value: guardian.patient_name,
  //         name: 'guardian',
  //         href:
  //           `${registration_href}/family#focus=family.guardians.${index}.patient_name`,
  //         action: DescriptionListCellAction.Edit,
  //       }, {
  //         value: guardian.family_relation_sexed,
  //         name: 'relationship',
  //         href:
  //           `${registration_href}/family#focus=family.guardians.${index}.family_relation_sexed`,
  //         action: DescriptionListCellAction.Edit,
  //         leading_separator: ', ',
  //       }],
  //       [{
  //         value: international_phone_number.nullable().parse(
  //           guardian.patient_phone_number,
  //         ),
  //         name: 'phone_number',
  //         href:
  //           `${registration_href}/family#focus=family.guardians.${index}.patient_phone_number`,
  //         action: DescriptionListCellAction.Edit,
  //       }],
  //     ]),
  // )

  // const occupation0_18_rows: DescriptionListRows[] = [nonEmptyRows([[
  //   {
  //     value: occupation?.school.status === 'in school'
  //       ? occupation.school.current.grade
  //       : null,
  //     name: 'education_level',
  //     href:
  //       `${registration_href}/occupation#focus=occupation.school.current.grade`,
  //     action: DescriptionListCellAction.Edit,
  //   },
  // ]])]

  // const occupation19_rows: DescriptionListRows[] = [nonEmptyRows([[
  //   {
  //     value: occupation?.job && occupation.job.profession,
  //     name: 'profession',
  //     href: `${registration_href}/occupation#focus=occupation.job.profession`,
  //     action: DescriptionListCellAction.Edit,
  //   },
  // ]])]

  // const allergies_items: DescriptionListRows[] = allergies.map(
  //   (allergy, index) => {
  //     return nonEmptyRows([
  //       [
  //         {
  //           value: allergy.snomed_english_term,
  //           name: 'allergy',
  //           href: `${registration_href}/conditions#focus=allergies.${index}`,
  //           action: DescriptionListCellAction.Edit,
  //         },
  //       ],
  //     ])
  //   },
  // )

  // const past_conditions_items: DescriptionListRows[] = past_medical_conditions
  //   .map(
  //     (condition, index) =>
  //       nonEmptyRows([
  //         [
  //           {
  //             value: condition.name,
  //             name: 'condition',
  //             href:
  //               `${registration_href}/history#focus=past_medical_conditions.${index}.name`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //         ],
  //         [
  //           {
  //             value: condition.start_date,
  //             name: 'start_date',
  //             href:
  //               `${registration_href}/history#focus=past_medical_conditions.${index}.start_date`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //           {
  //             value: condition.end_date,
  //             name: 'end_date',
  //             href:
  //               `${registration_href}/history#focus=past_medical_conditions.${index}.end_date`,
  //             action: DescriptionListCellAction.Edit,
  //             leading_separator: ' — ',
  //           },
  //         ],
  //       ]),
  //   )

  // const major_surgeries_items: DescriptionListRows[] = major_surgeries.map(
  //   (surgery, index) =>
  //     nonEmptyRows([
  //       [
  //         {
  //           value: surgery.name,
  //           name: 'surgery',
  //           href:
  //             `${registration_href}/history#focus=major_surgeries.${index}.name`,
  //           action: DescriptionListCellAction.Edit,
  //         },
  //       ],
  //       [
  //         {
  //           value: surgery.start_date,
  //           name: 'start_date',
  //           href:
  //             `${registration_href}/history#focus=major_surgeries.${index}.start_date`,
  //           action: DescriptionListCellAction.Edit,
  //         },
  //       ],
  //     ]),
  // )

  // const pre_existing_conditions_items: DescriptionListRows[] =
  //   pre_existing_conditions.map(
  //     (condition, index) =>
  //       nonEmptyRows([
  //         [
  //           {
  //             value: condition.name,
  //             name: 'Pre-existing Condition',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.name`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //         ],
  //         [
  //           {
  //             value: condition.start_date,
  //             name: 'start_date',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.start_date`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //           {
  //             value: 'Present',
  //             leading_separator: ' — ',
  //           },
  //         ],
  //       ]),
  //   )

  // const medications_items: DescriptionListRows[] = pre_existing_conditions
  //   .flatMap((condition, index) =>
  //     condition.medications.map((medication, medIndex) =>
  //       nonEmptyRows([
  //         [
  //           {
  //             value: `${medication.name} (for ${condition.name})`,
  //             name: 'medication',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.name`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //         ],
  //         [
  //           {
  //             value: strengthDisplay({
  //               strength_numerator: Decimal(medication.strength),
  //               strength_numerator_unit: medication.strength_numerator_unit,
  //               strength_denominator: Decimal(medication.strength_denominator),
  //               strength_denominator_unit: medication.strength_denominator_unit,
  //               separator: ' ',
  //             }),
  //             name: 'strength',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.strength`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //         ],
  //         [
  //           {
  //             value: dosageDisplay({
  //               dosage: medication.schedules[0].dosage,
  //               strength_numerator: Decimal(medication.strength),
  //               strength_denominator: Decimal(medication.strength_denominator),
  //               strength_denominator_unit: medication.strength_denominator_unit,
  //               strength_denominator_is_units:
  //                 medication.strength_denominator_is_units,
  //               strength_numerator_unit: medication.strength_numerator_unit,
  //             }),
  //             name: 'dosage',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.dosage`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //           {
  //             value: medication.route,
  //             name: 'route',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.route`,
  //             action: DescriptionListCellAction.Edit,
  //             leading_separator: ' ',
  //           },
  //           {
  //             value: registrationFrequencyText(
  //               medication.schedules[0].frequency,
  //             ),
  //             name: 'frequency',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.registration_frequency`,
  //             action: DescriptionListCellAction.Edit,
  //             leading_separator: ' ',
  //           },
  //         ],
  //         [
  //           {
  //             value: medication.start_date,
  //             name: 'start_date',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.start_date`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //           {
  //             // TODO get actual end date
  //             value: 'End Date',
  //             name: 'end_date',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.end_date`,
  //             action: DescriptionListCellAction.Edit,
  //             leading_separator: ' — ',
  //           },
  //         ],
  //         [
  //           {
  //             value: medication.special_instructions,
  //             name: 'special_instructions',
  //             href:
  //               `${registration_href}/conditions#focus=pre_existing_conditions.${index}.medications.${medIndex}.special_instructions`,
  //             action: DescriptionListCellAction.Edit,
  //           },
  //         ],
  //       ])
  //     )
  //   )

  // const family_page =
  //   (patient.age.age_years < 18 && patient.family.dependents.length > 0)
  //     ? {
  //       title: 'Family',
  //       link: `${registration_href}/family`,
  //       action: DescriptionListCellAction.Edit,
  //       items: family_items,
  //       sections: [
  //         {
  //           title: 'Guardians',
  //           items: guardians_items,
  //           edit_href: `${registration_href}/family#focus=add_guardian`,
  //         },
  //         {
  //           title: 'Dependents',
  //           items: dependents_items,
  //           edit_href: `${registration_href}/family#focus=add_dependent`,
  //         },
  //       ],
  //     }
  //     : (patient.age.age_years < 18 && patient.family.dependents.length === 0)
  //     ? {
  //       title: 'Family',
  //       items: family_items,
  //       link: `${registration_href}/family`,
  //       action: DescriptionListCellAction.Edit,
  //       sections: [
  //         {
  //           title: 'Guardians',
  //           items: guardians_items,
  //           edit_href: `${registration_href}/family#focus=add_guardian`,
  //         },
  //       ],
  //     }
  //     : {
  //       title: 'Family',
  //       items: family_items,
  //       link: `${registration_href}/family`,
  //       action: DescriptionListCellAction.Edit,
  //       sections: [
  //         {
  //           title: 'Next of kin',
  //           items: next_of_kin_items,
  //           edit_href: `${registration_href}/family#focus=next_of_kin.name`,
  //         },
  //         {
  //           title: 'Dependents',
  //           items: dependents_items,
  //           edit_href: `${registration_href}/family#focus=add_dependent`,
  //         },
  //       ],
  //     }

  // const occupation_page = {
  //   title: 'Occupation',
  //   link: `${registration_href}/occupation`,
  //   action: DescriptionListCellAction.Edit,
  //   items: patient.age.age_years <= 18
  //     ? occupation0_18_rows
  //     : occupation19_rows,
  //   sections: [],
  // }

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
    // family_page,
    // occupation_page,
    // {
    //   title: 'Pre-existing Conditions',
    //   link: `${registration_href}/conditions#focus=add_condition`,
    //   items: pre_existing_conditions_items,
    //   action: DescriptionListCellAction.Edit,
    //   sections: [
    //     {
    //       title: 'Medications',
    //       items: medications_items,
    //     },
    //     {
    //       title: 'Allergies',
    //       href: `${registration_href}/conditions#focus=allergies_search`,
    //       action: DescriptionListCellAction.Edit,
    //       items: allergies_items,
    //     },
    //   ],
    // },
    // {
    //   title: 'Past Conditions',
    //   link: `${registration_href}/history?focus=add_condition`,
    //   action: DescriptionListCellAction.Edit,
    //   items: past_conditions_items,
    //   sections: [
    //     {
    //       title: 'Major Surgeries',
    //       items: major_surgeries_items,
    //       href: `${registration_href}/history#focus=add_surgery`,
    //       action: DescriptionListCellAction.Edit,
    //     },
    //   ],
    // },
  ]

  return <DescriptionList pages={pages} />
}
