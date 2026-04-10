import { a_ as DescriptionListCellAction, u, a$ as DescriptionList, cR as PatientProfilePage } from "../server-entry.mjs";
import { p as patient_registration } from "./patient_registration-B5uIKBjP.mjs";
import { n as nonEmptyRows } from "./Summary-BF2H5f3f.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./patient_new-GAkLghDO.mjs";
import "./patient_new_encounters-aQfRoZZN.mjs";
function PatientSummary({
  patient
}) {
  const registration_href = `/app/patients/${patient.id}/registration`;
  const {
    personal,
    address,
    nearest_health_care
  } = patient;
  const personal_items = [nonEmptyRows([[{
    value: personal.name,
    href: `${registration_href}/personal#focus=first_names`,
    action: DescriptionListCellAction.View,
    name: "first_names"
  }], [{
    value: personal.phone_number,
    href: `${registration_href}/personal#focus=phone_number`,
    action: DescriptionListCellAction.View,
    name: "phone_number"
  }]])];
  const address_rows = [{
    value: address.street,
    name: "street",
    href: `${registration_href}/address#focus=address.street`,
    action: DescriptionListCellAction.View
  }, {
    value: address.locality,
    href: `${registration_href}/address#focus=address.locality`,
    action: DescriptionListCellAction.View,
    name: "Ward",
    leading_separator: ", "
  }];
  if (address.administrative_area_level_1 && address.administrative_area_level_1 !== address.locality) {
    address_rows.push({
      value: address.administrative_area_level_1,
      name: "District",
      href: `${registration_href}/address#focus=address.administrative_area_level_1`,
      action: DescriptionListCellAction.View,
      leading_separator: ", "
    });
  }
  if (address.administrative_area_level_2 && address.administrative_area_level_2 !== address.administrative_area_level_1 && address.administrative_area_level_2 !== address.locality) {
    address_rows.push({
      value: address.administrative_area_level_2,
      name: "Province",
      href: `${registration_href}/address#focus=address.administrative_area_level_2`,
      action: DescriptionListCellAction.View,
      leading_separator: ", "
    });
  }
  const address_items = [nonEmptyRows([address_rows])];
  const nearest_health_care_items = [nonEmptyRows([[{
    value: nearest_health_care.nearest_organization_name,
    href: `${registration_href}/address#focus=nearest_organization_name`,
    action: DescriptionListCellAction.View,
    name: "Nearest Organization"
  }], [{
    value: nearest_health_care.primary_doctor_name,
    href: `${registration_href}/address#focus=primary_doctor_name`,
    action: DescriptionListCellAction.View,
    name: "Primary Doctor"
  }]])];
  const pages = [{
    title: "Personal",
    link: `${registration_href}/personal`,
    action: DescriptionListCellAction.View,
    items: personal_items,
    sections: []
  }, {
    title: "Address",
    link: `${registration_href}/address`,
    action: DescriptionListCellAction.View,
    items: address_items,
    sections: [{
      title: "Nearest Health Care",
      items: nearest_health_care_items
    }]
  }];
  return u(DescriptionList, {
    pages
  });
}
const index = PatientProfilePage("Profile", async function PatientProfileTab(ctx) {
  const patient_summary = await patient_registration.getSummaryById(ctx.state.trx, ctx.state.patient.id);
  return u(PatientSummary, {
    patient: patient_summary
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_index = index;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_index as default,
  handler,
  handlers
};
