import { O as OpenEncounterWorkflowPage, m as assert, a1 as completeAndProceedToNextStep, r as redirect, F as object, a8 as boolean, ao as array, G as string, b4 as number, b5 as snomed_concept_id, a5 as todayISOInJohannesburg, u, bh as SymptomSection } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const MediaSchema = object({
  id: string()
});
const PatientSymptomSchema = object({
  done: boolean()
}).or(object({
  altered_patient_symptom_id: string().uuid().optional(),
  snomed_concept_id,
  severity: number().min(1).max(10),
  start_date: string().date(),
  end_date: string().date().optional(),
  notes: string().optional(),
  media: array(MediaSchema).optional()
}));
const handler$1 = postHandler(
  PatientSymptomSchema,
  // deno-lint-ignore require-await
  async (ctx, form_values) => {
    if ("done" in form_values) {
      assert(form_values.done);
      return completeAndProceedToNextStep(ctx);
    }
    return redirect(ctx.url);
  }
);
async function SymptomsPage(_ctx) {
  const symptoms2 = [];
  const today = todayISOInJohannesburg();
  return u(SymptomSection, {
    patient_symptoms: symptoms2,
    today
  });
}
const symptoms = OpenEncounterWorkflowPage(SymptomsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_symptoms = symptoms;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_symptoms as default,
  handler,
  handlers
};
