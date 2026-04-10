import { aU as base, a2 as promiseProps, k as patient_encounters, au as employees, aV as jsonObjectFrom, aI as sql } from "../server-entry.mjs";
import { T as TEST_ORGANIZATION_UUIDS } from "./organizations-DBMxrctL.mjs";
const employees_presence = base({
  top_level_table: "employment",
  baseQuery(trx, opts) {
    return employees.baseQuery(trx, opts).leftJoin("employment_presence", "employment_presence.id", "employment.id").select((eb) => [eb.fn.coalesce("employment_presence.at_work", sql.lit(false)).as("at_work"), jsonObjectFrom(patient_encounters.baseQuery(trx, {
      is_open: true
    }).where("patient_encounters.patient_id", "=", eb.ref("employment_presence.with_patient_id"))).as("open_encounter")]);
  },
  formatResult({
    open_encounter,
    ...employee
  }) {
    if (!open_encounter) {
      return {
        ...employee,
        open_encounter: null
      };
    }
    return {
      ...employee,
      open_encounter: patient_encounters.existsOpen(patient_encounters.formatResult(open_encounter))
    };
  },
  getForClinicAssumingTestHospital(trx, {
    organization_id,
    health_worker_id
  }) {
    const nearest_hospital_id = TEST_ORGANIZATION_UUIDS.ZA.hospital;
    return promiseProps({
      facility_employees: employees_presence.findAll(trx, {
        organization_id,
        excluding_health_worker_id: health_worker_id
      }),
      hospital_employees: employees_presence.findAll(trx, {
        organization_id: nearest_hospital_id,
        excluding_health_worker_id: health_worker_id
      })
    });
  }
});
export {
  employees_presence as e
};
