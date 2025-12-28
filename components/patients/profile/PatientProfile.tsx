import { getSummaryById } from '../../../db/models/patient_registration.ts'
import {
  DescriptionList,
  DescriptionListCellAction,
  type DescriptionListRows,
} from '../../library/DescriptionList.tsx'
import { nonEmptyRows } from '../registration/Summary.tsx'

type RegistrationPatientSummary = Awaited<ReturnType<typeof getSummaryById>>

export default function PatientSummary(
  { patient }: {
    patient: RegistrationPatientSummary
  },
) {
  const registration_href = `/app/patients/${patient.id}/registration`

  const {
    personal,
    address,
    nearest_health_care,
  } = patient

  const personal_items: DescriptionListRows[] = [
    nonEmptyRows([[{
      value: personal.name,
      href: `${registration_href}/personal#focus=first_names`,
      action: DescriptionListCellAction.View,
      name: 'first_names',
    }], [{
      value: personal.phone_number,
      href: `${registration_href}/personal#focus=phone_number`,
      action: DescriptionListCellAction.View,
      name: 'phone_number',
    }]]),
  ]

  const address_rows = [{
    value: address.street,
    name: 'street',
    href: `${registration_href}/address#focus=address.street`,
    action: DescriptionListCellAction.View,
  }, {
    value: address.locality,
    href: `${registration_href}/address#focus=address.locality`,
    action: DescriptionListCellAction.View,
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
        `${registration_href}/address#focus=address.administrative_area_level_1`,
      action: DescriptionListCellAction.View,
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
        `${registration_href}/address#focus=address.administrative_area_level_2`,
      action: DescriptionListCellAction.View,
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
        href: `${registration_href}/address#focus=nearest_organization_name`,
        action: DescriptionListCellAction.View,
        name: 'Nearest Organization',
      },
    ], [{
      value: nearest_health_care.primary_doctor_name,
      href: `${registration_href}/address#focus=primary_doctor_name`,
      action: DescriptionListCellAction.View,
      name: 'Primary Doctor',
    }]]),
  ]

  const pages = [
    {
      title: 'Personal',
      link: `${registration_href}/personal`,
      action: DescriptionListCellAction.View,
      items: personal_items,
      sections: [],
    },
    {
      title: 'Address',
      link: `${registration_href}/address`,
      action: DescriptionListCellAction.View,
      items: address_items,
      sections: [
        {
          title: 'Nearest Health Care',
          items: nearest_health_care_items,
        },
      ],
    },
  ]

  return <DescriptionList pages={pages} />
}
