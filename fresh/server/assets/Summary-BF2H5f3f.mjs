import { a_ as DescriptionListCellAction, u, a$ as DescriptionList, ak as omit } from "../server-entry.mjs";
function isCell(cell) {
  return !!cell.value;
}
function nonNullableCells(row) {
  const non_null_row = row.filter(isCell);
  if (non_null_row[0]?.leading_separator) {
    non_null_row[0] = omit(non_null_row[0], ["leading_separator"]);
  }
  return non_null_row;
}
function nonEmptyRows(rows) {
  return rows.map(nonNullableCells).filter((row) => row.length);
}
function PatientRegistrationSummary({
  organization_id,
  patient,
  this_visit
}) {
  const registration_href = `/app/organizations/${organization_id}/patients/${patient.id}/open_encounter/registration`;
  const {
    personal,
    address,
    nearest_health_care
  } = patient;
  const personal_items = [nonEmptyRows([[{
    value: personal.first_names,
    href: `${registration_href}/personal#focus=first_names`,
    action: DescriptionListCellAction.Edit,
    name: "first_names"
  }, {
    value: personal.surname,
    href: `${registration_href}/personal#focus=surname`,
    action: DescriptionListCellAction.Edit,
    name: "surname",
    leading_separator: " "
  }, {
    value: personal.preferred_name !== personal.first_names ? `(${personal.preferred_name})` : void 0,
    href: `${registration_href}/personal#focus=preferred_name`,
    action: DescriptionListCellAction.Edit,
    name: "preferred_name",
    leading_separator: " "
  }], [{
    value: personal.sex,
    href: `${registration_href}/personal#focus=sex`,
    action: DescriptionListCellAction.Edit,
    name: "sex"
  }, {
    value: personal.gender,
    href: `${registration_href}/personal#focus=gender`,
    action: DescriptionListCellAction.Edit,
    name: "gender",
    leading_separator: " • "
  }, {
    value: personal.date_of_birth,
    href: `${registration_href}/personal#focus=date_of_birth`,
    action: DescriptionListCellAction.Edit,
    name: "date_of_birth",
    leading_separator: " • "
  }], [{
    value: personal.national_id_number,
    href: `${registration_href}/personal#focus=national_id_number`,
    action: DescriptionListCellAction.Edit,
    name: "national_id_number"
  }]])];
  const this_visit_items = [nonEmptyRows([[{
    value: this_visit.reason,
    href: `${registration_href}/primary_care#focus=reason`,
    action: DescriptionListCellAction.Edit,
    name: "Reason"
  }], [{
    value: this_visit.notes,
    href: `${registration_href}/primary_care#focus=notes`,
    action: DescriptionListCellAction.Edit,
    name: "Notes"
  }]])];
  const address_rows = [{
    value: address.street,
    name: "street",
    href: `${registration_href}/contacts#focus=address.street`,
    action: DescriptionListCellAction.Edit
  }, {
    value: address.locality,
    href: `${registration_href}/contacts#focus=address.locality`,
    action: DescriptionListCellAction.Edit,
    name: "Ward",
    leading_separator: ", "
  }];
  if (address.administrative_area_level_1 && address.administrative_area_level_1 !== address.locality) {
    address_rows.push({
      value: address.administrative_area_level_1,
      name: "District",
      href: `${registration_href}/primary_care#focus=address.administrative_area_level_1`,
      action: DescriptionListCellAction.Edit,
      leading_separator: ", "
    });
  }
  if (address.administrative_area_level_2 && address.administrative_area_level_2 !== address.administrative_area_level_1 && address.administrative_area_level_2 !== address.locality) {
    address_rows.push({
      value: address.administrative_area_level_2,
      name: "Province",
      href: `${registration_href}/primary_care#focus=address.administrative_area_level_2`,
      action: DescriptionListCellAction.Edit,
      leading_separator: ", "
    });
  }
  const address_items = [nonEmptyRows([address_rows])];
  const nearest_health_care_items = [nonEmptyRows([[{
    value: nearest_health_care.nearest_organization_name,
    href: `${registration_href}/primary_care#focus=nearest_organization_name`,
    action: DescriptionListCellAction.Edit,
    name: "Nearest Organization"
  }], [{
    value: nearest_health_care.primary_doctor_name,
    href: `${registration_href}/primary_care#focus=primary_doctor_name`,
    action: DescriptionListCellAction.Edit,
    name: "Primary Doctor"
  }]])];
  const pages = [{
    title: "Personal",
    link: `${registration_href}/personal`,
    action: DescriptionListCellAction.Edit,
    items: personal_items,
    sections: []
  }, {
    title: "This Visit",
    link: `${registration_href}/primary_care`,
    action: DescriptionListCellAction.Edit,
    items: this_visit_items,
    sections: []
  }, {
    title: "Primary care",
    link: `${registration_href}/primary_care`,
    action: DescriptionListCellAction.Edit,
    items: nearest_health_care_items,
    sections: []
  }, {
    title: "Contacts",
    link: `${registration_href}/primary_care`,
    action: DescriptionListCellAction.Edit,
    items: address_items,
    sections: []
  }];
  return u(DescriptionList, {
    pages
  });
}
export {
  PatientRegistrationSummary as P,
  nonEmptyRows as n
};
