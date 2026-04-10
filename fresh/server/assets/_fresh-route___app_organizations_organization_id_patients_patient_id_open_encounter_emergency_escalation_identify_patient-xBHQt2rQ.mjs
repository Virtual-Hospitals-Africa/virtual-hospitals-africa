import { O as OpenEncounterWorkflowPage, a2 as promiseProps, a1 as completeAndProceedToNextStep, p as patients, cJ as asNames, cK as assertNotEquals, V as patient_workflows, r as redirect, z, cL as positive_integer, ah as varchar255, ai as sex, a, u, cM as ModeOfArrivalFormSection, cN as Separator, cO as ReturningOrNewPatient } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_new_encounters } from "./patient_new_encounters-aQfRoZZN.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1 = ["", "", "", ""];
const EmergencyEscalationIdentifyPatientSchema = z.object({
  patient_id: z.string().uuid().optional(),
  patient_name: varchar255,
  date_of_birth: z.string().date(),
  sex,
  gender: varchar255,
  mode_of_arrival: z.enum(["just_arrived", "en_route_personal", "en_route_ambulance"]),
  eta_minutes: positive_integer.optional().default(0)
});
const handler$1 = postHandler(EmergencyEscalationIdentifyPatientSchema, async (ctx, {
  patient_id: identified_patient_id,
  ...form_values
}) => {
  const {
    trx,
    organization,
    organization_employment,
    workflow,
    step,
    organization_id
  } = ctx.state;
  const newly_created_patient = ctx.state.patient_id;
  if (!identified_patient_id) {
    const {
      response
    } = await promiseProps({
      updating_patient: patients.updateById(trx, newly_created_patient, {
        ...asNames({
          name: form_values.patient_name
        }),
        date_of_birth: form_values.date_of_birth,
        sex: form_values.sex,
        gender: form_values.gender
      }),
      response: completeAndProceedToNextStep(ctx)
    });
    return response;
  }
  assertNotEquals(identified_patient_id, newly_created_patient);
  await patients.removeById(trx, newly_created_patient);
  ctx.state.encounter_expected_to_not_exist_after_post = true;
  const {
    patient_workflow_id
  } = await patient_new_encounters.create(trx, {
    organization,
    organization_employment,
    patient: {
      patient_id: identified_patient_id
    },
    current_workflow: "emergency_escalation",
    next_workflows: ["stabilization"]
  });
  await patient_workflows.completedStep(trx, {
    workflow,
    step,
    patient_workflow_id
  });
  const first_incomplete_step = "emergency_reason";
  return redirect(`/app/organizations/${organization_id}/patients/${identified_patient_id}/open_encounter/${workflow}/${first_incomplete_step}`);
});
async function EmergencyEscalationIdentifyPatientPage(ctx) {
  return a($$_tpl_1, u(ReturningOrNewPatient, {
    patient: ctx.state.patient
  }), u(Separator, null), u(ModeOfArrivalFormSection, {
    organization_category: ctx.state.organization.category
  }));
}
const identify_patient = OpenEncounterWorkflowPage(EmergencyEscalationIdentifyPatientPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_identify_patient = identify_patient;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_emergency_escalation_identify_patient as default,
  handler,
  handlers
};
