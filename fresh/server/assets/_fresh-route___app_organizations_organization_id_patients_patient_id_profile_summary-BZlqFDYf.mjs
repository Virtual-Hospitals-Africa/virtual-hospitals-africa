import { u, a$ as DescriptionList, a_ as DescriptionListCellAction, cR as PatientProfilePage } from "../server-entry.mjs";
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
    pre_existing_conditions
  } = patient;
  const pre_existing_conditions_items = pre_existing_conditions.map((_condition, _index) => nonEmptyRows([]));
  const medications_items = pre_existing_conditions.flatMap(
    (_condition, _index) => []
    // condition.medications.map((medication, medIndex) =>
  );
  const pages = [{
    title: "Pre-existing Conditions",
    link: `${registration_href}/conditions`,
    action: DescriptionListCellAction.View,
    items: pre_existing_conditions_items,
    sections: [{
      title: "Medications",
      items: medications_items
    }]
  }];
  return u(DescriptionList, {
    pages
  });
}
const summary = PatientProfilePage("Summary", async function PatientSummaryTab(ctx) {
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
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_summary = summary;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_summary as default,
  handler,
  handlers
};
