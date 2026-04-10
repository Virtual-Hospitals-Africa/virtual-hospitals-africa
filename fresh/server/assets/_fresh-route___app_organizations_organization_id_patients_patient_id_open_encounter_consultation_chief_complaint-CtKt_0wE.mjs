import { b7 as EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS, ad as generateUUID, b8 as markAltered, aO as blankSelection, b9 as PROCEDURE, ba as CHIEF_COMPLAINT, bb as CLINICAL_FINDING, bc as AUDIO_RECORDING_OF_SUBJECT_INTERVIEW, aQ as success_true, O as OpenEncounterWorkflowPage, g as getRequiredUUIDParam, a1 as completeAndProceedToNextStep, F as object, G as string, u, bd as ChiefComplaintSection } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const patient_chief_complaints = {
  // // TODO: get this into a single round trip with the DB
  async upsertOne(trx, {
    patient_id,
    patient_encounter_id,
    employment_id,
    patient_encounter_employee_id,
    chief_complaint: chief_complaint2
  }) {
    const {
      altered_patient_chief_complaint_id,
      language_code,
      note,
      media_speech_id
    } = chief_complaint2;
    const existing_procedure = await trx.selectFrom("patient_records").innerJoin("patient_procedures", "patient_records.id", "patient_procedures.id").where("patient_records.patient_id", "=", patient_id).where("patient_records.patient_encounter_id", "=", patient_encounter_id).where("patient_records.specific_snomed_concept_id", "=", EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS.id).select(["patient_procedures.id"]).executeTakeFirst();
    const procedure_id = existing_procedure?.id || generateUUID();
    const speech_record_id = media_speech_id && generateUUID();
    const chief_complaint_id = generateUUID();
    if (altered_patient_chief_complaint_id) {
      await markAltered(trx, {
        patient_id,
        patient_encounter_id,
        employment_id,
        procedure_id,
        altered_record_ids: [altered_patient_chief_complaint_id]
      });
    }
    return trx.with("inserting_procedure_record", (qb) => !existing_procedure ? qb.insertInto("patient_records").values({
      id: procedure_id,
      patient_id,
      patient_encounter_id,
      root_snomed_concept_id: PROCEDURE.id,
      specific_snomed_concept_id: EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS.id
    }) : blankSelection(qb)).with("inserting_procedure", (qb) => !existing_procedure ? qb.insertInto("patient_procedures").values({
      id: procedure_id,
      employment_id
    }) : blankSelection(qb)).with("inserting_finding_records", (qb) => qb.insertInto("patient_records").values({
      id: chief_complaint_id,
      patient_id,
      patient_encounter_id,
      // TODO: pick a better concept?
      root_snomed_concept_id: CLINICAL_FINDING.id,
      specific_snomed_concept_id: CHIEF_COMPLAINT.id
    })).with("inserting_findings", (qb) => qb.insertInto("patient_findings").values({
      id: chief_complaint_id,
      procedure_id,
      patient_encounter_employee_id
    })).with("inserting_chief_complaint", (qb) => qb.insertInto("patient_chief_complaints").values({
      id: chief_complaint_id,
      note,
      language_code
    })).with("inserting_speech_record", (qb) => speech_record_id ? qb.insertInto("patient_records").values({
      id: speech_record_id,
      patient_id,
      patient_encounter_id,
      // TODO pick a better concept?
      root_snomed_concept_id: CLINICAL_FINDING.id,
      specific_snomed_concept_id: AUDIO_RECORDING_OF_SUBJECT_INTERVIEW.id
    }) : blankSelection(qb)).with("inserting_speech_finding", (qb) => speech_record_id ? qb.insertInto("patient_findings").values({
      id: speech_record_id,
      patient_encounter_employee_id,
      procedure_id
    }) : blankSelection(qb)).with("inserting_speech_finding_media_speech", (qb) => speech_record_id ? qb.insertInto("patient_finding_media_speeches").values({
      id: speech_record_id,
      finding_id: chief_complaint_id,
      media_speech_id
    }) : blankSelection(qb)).selectNoFrom([success_true]).executeTakeFirstOrThrow();
  },
  getEncounter(trx, {
    patient_id,
    patient_encounter_id
  }) {
    return trx.selectFrom("patient_records").innerJoin("patient_findings", "patient_findings.id", "patient_records.id").innerJoin("patient_records_still_valid", "patient_records_still_valid.id", "patient_records.id").innerJoin("patient_chief_complaints", "patient_chief_complaints.id", "patient_findings.id").innerJoin("snomed_inferred_canonical_name_and_category", "patient_records.specific_snomed_concept_id", "snomed_inferred_canonical_name_and_category.id").where("patient_records.patient_id", "=", patient_id).where("patient_records.patient_encounter_id", "=", patient_encounter_id).leftJoin("patient_finding_media_speeches", "patient_finding_media_speeches.finding_id", "patient_chief_complaints.id").selectAll("patient_records").select(["patient_chief_complaints.id", "snomed_inferred_canonical_name_and_category.name"]).executeTakeFirst();
  }
};
const PatientChiefComplaintSchema = object({
  altered_patient_chief_complaint_id: string().uuid().optional(),
  language_code: string().length(3),
  media_speech_id: string().optional(),
  note: string()
});
const handler$1 = postHandler(PatientChiefComplaintSchema, async (ctx, form_values) => {
  const patient_id = getRequiredUUIDParam(ctx, "patient_id");
  await patient_chief_complaints.upsertOne(ctx.state.trx, {
    patient_id,
    patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    employment_id: ctx.state.organization_employment.employment_id,
    patient_encounter_employee_id: ctx.state.encounter_employee_presence.patient_encounter_employee_id,
    chief_complaint: form_values
  });
  return completeAndProceedToNextStep(ctx);
});
async function ChiefComplaintPage(ctx) {
  const chief_complaint2 = await patient_chief_complaints.getEncounter(ctx.state.trx, {
    patient_encounter_id: ctx.state.encounter.patient_encounter_id,
    patient_id: ctx.state.patient.id
  });
  return u(ChiefComplaintSection, {
    preferred_language_code_iso_639_2_b: ctx.state.patient.preferred_language_code_iso_639_2_b,
    patient_chief_complaint: chief_complaint2
  });
}
const chief_complaint = OpenEncounterWorkflowPage(ChiefComplaintPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_chief_complaint = chief_complaint;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_consultation_chief_complaint as default,
  handler,
  handlers
};
