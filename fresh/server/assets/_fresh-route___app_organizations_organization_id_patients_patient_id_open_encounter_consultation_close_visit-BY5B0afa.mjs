import { O as OpenEncounterWorkflowPage, a2 as promiseProps, k as patient_encounters, a1 as completeAndProceedToNextStep, r as redirect, bg as assertAllPriorStepsCompleted, a } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["<p>TODO</p>"];
const handler$1 = {
  async POST(ctx) {
    const {
      trx,
      encounter
    } = ctx.state;
    await promiseProps({
      completing_step: completeAndProceedToNextStep(ctx),
      completing_encounter: patient_encounters.close(trx, {
        patient_encounter_id: encounter.patient_encounter_id
      })
    });
    const success = `🩺 Thanks for seeing ${ctx.state.patient.name}!`;
    return redirect(`/app?success=${encodeURIComponent(success)}`);
  }
};
const close_visit = OpenEncounterWorkflowPage(function CloseVisitPage(ctx) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: true
  });
  return a($$_tpl_1);
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_close_visit = close_visit;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_close_visit as default,
  handler,
  handlers
};
