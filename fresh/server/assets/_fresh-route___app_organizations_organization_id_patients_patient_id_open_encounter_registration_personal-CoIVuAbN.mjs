import { O as OpenEncounterWorkflowPage, a2 as promiseProps, a1 as completeAndProceedToNextStep, p as patients, F as object, _ as _enum, ah as varchar255, ai as sex, G as string, a8 as boolean, a9 as string_or_number_as_string, aj as LIVING_LANGUAGES, ak as omit, u, al as SERVER_COUNTRY, am as PatientRegistrationPersonalSection } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { n as nationalIdCheckResult } from "./southAfricanNationalId-B3Rfp6YN.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const PatientRegistrationPersonalSchema = object({
  first_names: varchar255,
  surname: varchar255,
  preferred_name: varchar255,
  national_id_number: string_or_number_as_string.optional(),
  no_national_id: boolean().optional(),
  date_of_birth: string().date(),
  sex,
  gender: varchar255,
  preferred_language_code_iso_639_2_b: _enum(LIVING_LANGUAGES.map((lang) => lang.iso_639_2_b))
}).refine((data) => data.national_id_number || data.no_national_id, {
  message: "Must either provide national id number or check no national id",
  path: ["national_id_number"]
}).superRefine((patient, ctx) => {
  if (!patient.national_id_number) return;
  const result = nationalIdCheckResult({
    sex: patient.sex,
    date_of_birth: patient.date_of_birth,
    national_id_number: patient.national_id_number
  });
  if (result.success) return;
  ctx.addIssue({
    code: "custom",
    message: result.error.message || result.error.stack,
    path: ["national_id_number"]
  });
}).transform((patient) => omit(patient, ["no_national_id"]));
const handler$1 = postHandler(PatientRegistrationPersonalSchema, async (ctx, form_values) => {
  const {
    response
  } = await promiseProps({
    upserting_patient: patients.upsert(ctx.state.trx, {
      id: ctx.state.patient.id,
      ...form_values
    }),
    response: completeAndProceedToNextStep(ctx)
  });
  return response;
});
async function PatientRegistrationPersonalPage(ctx) {
  return u(PatientRegistrationPersonalSection, {
    header: "Patient Information",
    patient: ctx.state.patient,
    organization_default_language_code: ctx.state.organization.most_common_language_code,
    server_country: SERVER_COUNTRY,
    previously_completed_step: ctx.state.previously_completed_step,
    include_language_and_national_id_inputs: true,
    required: true
  });
}
const personal = OpenEncounterWorkflowPage(PatientRegistrationPersonalPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_personal = personal;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_personal as default,
  handler,
  handlers
};
