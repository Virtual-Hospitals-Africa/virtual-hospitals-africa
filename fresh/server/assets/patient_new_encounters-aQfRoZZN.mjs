import { m as assert, aN as assertOr403, ad as generateUUID, aO as blankSelection, al as SERVER_COUNTRY, aP as literalLocation, aQ as success_true } from "../server-entry.mjs";
function isEmployedInDepartment(organization_employment, department_name) {
  return organization_employment.in_departments.find((d) => d.name === department_name);
}
const patient_new_encounters = {
  async create(trx, {
    patient,
    organization,
    organization_employment,
    current_workflow,
    next_workflows
  }) {
    const {
      location,
      reception_id,
      id: organization_id
    } = organization;
    assert(location);
    assert(reception_id);
    assertOr403(isEmployedInDepartment(organization_employment, "Reception"), "Must work in the reception department to create patients");
    const patient_id = patient.patient_id || generateUUID();
    const patient_encounter_id = generateUUID();
    const patient_encounter_employee_id = generateUUID();
    const workflows = [current_workflow, ...next_workflows].map((workflow) => ({
      id: generateUUID(),
      patient_encounter_id,
      workflow
    }));
    const {
      success
    } = await trx.with("inserting_patient", (qb) => patient.create ? qb.insertInto("patients").values({
      id: patient_id,
      country: SERVER_COUNTRY
    }) : blankSelection(qb)).with("inserting_patient_encounter", (qb) => qb.insertInto("patient_encounters").values({
      patient_id,
      organization_id,
      id: patient_encounter_id,
      location: literalLocation(location)
    })).with("inserting_registration_workflow", (qb) => qb.insertInto("patient_workflows").values(workflows)).with("inserting_patient_presence", (qb) => qb.insertInto("patient_presence").values({
      id: patient_id,
      patient_encounter_id,
      organization_id,
      department_name: "Reception",
      current_workflow,
      organization_room_id: reception_id
    })).with("inserting_patient_encounter_employee", (qb) => qb.insertInto("patient_encounter_employees").values({
      id: patient_encounter_employee_id,
      patient_encounter_id,
      employment_id: organization_employment.employment_id
    })).with("inserting_employment_presence", (qb) => qb.insertInto("employment_presence").values({
      id: organization_employment.employment_id,
      at_work: true,
      with_patient_id: patient_id
    }).onConflict((oc) => oc.column("id").doUpdateSet({
      at_work: true,
      with_patient_id: patient_id
    }))).with("inserting_patient_workflow_started", (qb) => qb.insertInto("patient_workflows_started").values({
      patient_workflow_id: workflows[0].id,
      patient_encounter_employee_id
    })).selectNoFrom([success_true]).executeTakeFirstOrThrow();
    return {
      success,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      patient_workflow_id: workflows[0].id
    };
  }
};
export {
  patient_new_encounters as p
};
