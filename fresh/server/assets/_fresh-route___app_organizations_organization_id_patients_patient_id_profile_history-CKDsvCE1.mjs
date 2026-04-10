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
function PatientHistory({
  patient
}) {
  const registration_href = `/app/patients/${patient.id}/registration`;
  const {
    past_medical_conditions,
    major_surgeries
  } = patient;
  const past_conditions_items = past_medical_conditions.map((_condition, _index) => nonEmptyRows([]));
  const major_surgeries_items = major_surgeries.map((_surgery, _index) => nonEmptyRows([]));
  const pages = [{
    title: "Past Conditions",
    link: `${registration_href}/history`,
    action: DescriptionListCellAction.View,
    items: past_conditions_items,
    sections: [{
      title: "Major Surgeries",
      items: major_surgeries_items
    }]
  }];
  return u(DescriptionList, {
    pages
  });
}
const history = PatientProfilePage("History", async function PatientHistoryTab(ctx) {
  const patient_summary = await patient_registration.getSummaryById(ctx.state.trx, ctx.state.patient.id);
  return u(PatientHistory, {
    patient: patient_summary
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_profile_history = history;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_profile_history as default,
  handler,
  handlers
};
