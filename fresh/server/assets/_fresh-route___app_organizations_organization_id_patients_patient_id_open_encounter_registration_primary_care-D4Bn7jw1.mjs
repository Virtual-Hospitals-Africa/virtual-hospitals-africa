import { a2 as promiseProps, a3 as concat, a4 as today_in_johannesburg, a5 as todayISOInJohannesburg, v as assertOr400, a6 as isoDate, O as OpenEncounterWorkflowPage, a1 as completeAndProceedToNextStep, F as object, G as string, a7 as literal, a8 as boolean, a9 as string_or_number_as_string, a, u, aa as HealthInsuranceSection, ab as NearestHealthCareSection } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const patient_primary_care = {
  getPrimaryDoctor(trx, {
    patient_id
  }) {
    return trx.selectFrom("patients").leftJoin("employment", "employment.id", "patients.primary_doctor_id").leftJoin("health_workers", "health_workers.id", "employment.health_worker_id").select((eb) => [eb.ref("patients.primary_doctor_id").as("id"), concat("Dr. ", eb.ref("health_workers.name")).as("name")]).where("patients.id", "=", patient_id).where((eb) => eb("primary_doctor_id", "is not", null)).executeTakeFirst();
  },
  getNearestHealthFacility(trx, {
    patient_id
  }) {
    return trx.selectFrom("patients").innerJoin("organizations", "organizations.id", "patients.nearest_organization_id").select((eb) => [eb.ref("nearest_organization_id").$notNull().as("id"), eb.ref("organizations.name").$notNull().as("name")]).where("patients.id", "=", patient_id).where("nearest_organization_id", "is not", null).executeTakeFirst();
  },
  getById(trx, {
    patient_id
  }) {
    return promiseProps({
      primary_doctor: patient_primary_care.getPrimaryDoctor(trx, {
        patient_id
      }),
      nearest_health_facility: patient_primary_care.getNearestHealthFacility(trx, {
        patient_id
      })
    });
  },
  setPrimaryDoctor(trx, {
    patient_id,
    primary_doctor_id
  }) {
    return trx.updateTable("patients").where("id", "=", patient_id).set("primary_doctor_id", primary_doctor_id).executeTakeFirstOrThrow();
  },
  setNearestHealthFacility(trx, {
    patient_id,
    nearest_organization_id
  }) {
    return trx.updateTable("patients").where("id", "=", patient_id).set("nearest_organization_id", nearest_organization_id).executeTakeFirstOrThrow();
  }
};
function baseQuery(trx) {
  return trx.selectFrom("patient_insurance").select((eb) => ["id", "insurance_provider", "plan_name", "membership_number", isoDate(eb.ref("valid_from")).as("valid_from"), isoDate(eb.ref("expire_date")).as("expire_date"), "is_dependent"]);
}
const patient_insurance = {
  getById(trx, {
    patient_id
  }) {
    return baseQuery(trx).where("patient_insurance.patient_id", "=", patient_id).orderBy("expire_date", "desc").execute();
  },
  getCurrent(trx, {
    patient_id
  }) {
    return baseQuery(trx).where("patient_insurance.patient_id", "=", patient_id).where("valid_from", "<=", today_in_johannesburg).where("expire_date", ">=", today_in_johannesburg).executeTakeFirst();
  },
  async setCurrent(trx, insert) {
    const today = todayISOInJohannesburg();
    assertOr400(insert.valid_from <= today, "Insurance valid_from date must be in the past or today");
    assertOr400(insert.expire_date >= today, "Insurance expire_date must be in the future or today");
    const current_insurance = await patient_insurance.getCurrent(trx, {
      patient_id: insert.patient_id
    });
    if (current_insurance) {
      return trx.updateTable("patient_insurance").set(insert).where("id", "=", current_insurance.id).execute();
    }
    return trx.insertInto("patient_insurance").values(insert).executeTakeFirstOrThrow();
  },
  clearCurrent(trx, {
    patient_id
  }) {
    return trx.deleteFrom("patient_insurance").where("patient_id", "=", patient_id).where("valid_from", "<=", today_in_johannesburg).where("expire_date", ">=", today_in_johannesburg).execute();
  }
};
const $$_tpl_1 = ["", "", ""];
const PatientRegistrationPrimaryCareSchema = object({
  primary_doctor_id: string().uuid().optional(),
  nearest_organization_id: string(),
  insurance: object({
    has_no_insurance: literal(true)
  }).or(object({
    has_no_insurance: boolean().optional(),
    insurance_provider: string(),
    plan_name: string().optional(),
    membership_number: string_or_number_as_string,
    valid_from: string().date(),
    expire_date: string().date(),
    is_dependent: boolean().optional().default(false)
  }))
});
const handler$1 = postHandler(PatientRegistrationPrimaryCareSchema, async (ctx, {
  primary_doctor_id,
  nearest_organization_id,
  insurance
}) => {
  const {
    trx,
    patient
  } = ctx.state;
  const patient_id = patient.id;
  const {
    response
  } = await promiseProps({
    setting_primary_doctor: primary_doctor_id ? patient_primary_care.setPrimaryDoctor(trx, {
      patient_id,
      primary_doctor_id
    }) : Promise.resolve(),
    setting_nearest_facility: patient_primary_care.setNearestHealthFacility(trx, {
      patient_id,
      nearest_organization_id
    }),
    updating_insurance: insurance.has_no_insurance ? patient_insurance.clearCurrent(trx, {
      patient_id
    }) : patient_insurance.setCurrent(trx, {
      patient_id,
      ...insurance
    }),
    response: completeAndProceedToNextStep(ctx)
  });
  return response;
});
async function PatientRegistrationPrimaryCarePage({
  state: {
    trx,
    patient,
    previously_completed_step
  }
}) {
  const {
    primary_care: primary_care2,
    current_insurance
  } = await promiseProps({
    primary_care: patient_primary_care.getById(trx, {
      patient_id: patient.id
    }),
    current_insurance: patient_insurance.getCurrent(trx, {
      patient_id: patient.id
    })
  });
  return a($$_tpl_1, u(NearestHealthCareSection, {
    ...primary_care2
  }), u(HealthInsuranceSection, {
    current_insurance,
    previously_completed_form: previously_completed_step
  }));
}
const primary_care = OpenEncounterWorkflowPage(PatientRegistrationPrimaryCarePage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_primary_care = primary_care;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_primary_care as default,
  handler,
  handlers
};
