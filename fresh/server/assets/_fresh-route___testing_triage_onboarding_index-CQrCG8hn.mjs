import { cJ as asNames, ep as health_worker_google_tokens, eq as randomNamesAndSex, er as randomAvatarMediaId, ad as generateUUID, es as asMaybeNames, m as assert, et as organizationDepartmentIdsOfProfession, cK as assertNotEquals, eu as health_worker_licences, b1 as parseDate, ev as sample, e8 as isKeyOf, ew as OFFICIAL_LANGUAGES, p as patients, V as patient_workflows, k as patient_encounters, S as assertEquals, a2 as promiseProps, h as health_workers, aW as organizations, aS as WORKFLOW_STEPS, ex as workflowStepKey, u, a, av as Form, B as Button, aF as PageHeader, dE as pMap, e4 as range, du as sessions, al as SERVER_COUNTRY, r as redirect, dv as setCookie, dw as session_key, F as object } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { o as organizations_with_departments, e as employment } from "./organizations_with_departments-D1x0hCCJ.mjs";
import { c as createTestOrganization } from "./organizations-DBMxrctL.mjs";
import { e as employment_calendars } from "./employment_calendars-DTp7pD3u.mjs";
import { p as patient_registration } from "./patient_registration-B5uIKBjP.mjs";
import { h as healthWorkerIdOfEmploymentId } from "./health_worker_id-B810p7q_.mjs";
import { m as mod10CheckDigit } from "./southAfricanNationalId-B3Rfp6YN.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
import "./addresses-DYgdsFAd.mjs";
import "./patient_new-GAkLghDO.mjs";
import "./patient_new_encounters-aQfRoZZN.mjs";
function testHealthWorker() {
  const expires_at = /* @__PURE__ */ new Date();
  expires_at.setHours(expires_at.getHours() + 1);
  const {
    sex: _sex,
    ...names
  } = randomNamesAndSex("ZA");
  return {
    ...names,
    email: generateUUID() + "@example.com",
    avatar_media_id: randomAvatarMediaId(),
    access_token: "access." + generateUUID(),
    refresh_token: "refresh." + generateUUID(),
    expires_in: 3599,
    expires_at
  };
}
function insertHealthWorker(trx, opts) {
  const defaults = testHealthWorker();
  const to_insert = {
    ...defaults,
    ...opts,
    ...asNames(opts)
  };
  return health_worker_google_tokens.insertWithGoogleCredentials(trx, to_insert);
}
function testCalendars() {
  return {
    gcal_appointments_calendar_id: generateUUID() + "@appointments.calendar.google.com",
    gcal_availability_calendar_id: generateUUID() + "@availability.calendar.google.com"
  };
}
async function addTestEmployee(trx, {
  role = "nurse",
  organization_id = "00000000-0000-1000-8000-000000000001",
  country = "ZA",
  health_worker_attrs = {},
  specialty,
  is_admin
} = {}) {
  if (!specialty && ["nurse", "doctor"].includes(role)) {
    specialty = "Primary care";
  }
  const health_worker = await insertHealthWorker(trx, {
    ...testHealthWorker(),
    ...health_worker_attrs,
    ...asMaybeNames(health_worker_attrs)
  });
  if (role === "none") {
    assert(!is_admin);
    return {
      ...health_worker,
      get organization_id() {
        throw new Error("Not actually an employee. Therefore, does not have organization_id");
      },
      get employee_id() {
        throw new Error("Not actually an employee. Therefore, does not have employee_id");
      },
      get calendars() {
        throw new Error("Not actually an employee. Therefore, does not have calendars");
      }
    };
  }
  const organization = await organizations_with_departments.getById(trx, organization_id);
  const department_ids = organizationDepartmentIdsOfProfession(organization, role, specialty);
  if (is_admin) {
    assertNotEquals(role, "admin");
    const admin_department_ids = organizationDepartmentIdsOfProfession(organization, "admin");
    department_ids.push(...admin_department_ids);
  }
  const created_employee = await employment.addOne(trx, {
    organization_id,
    role,
    is_admin: role === "admin" || !!is_admin,
    department_ids,
    health_worker_id: health_worker.id
  });
  const employee_id = created_employee.id;
  const calendars = testCalendars();
  await employment_calendars.add(trx, [{
    ...calendars,
    employment_id: employee_id,
    availability_set: true
  }]);
  await health_worker_licences.insertTest(trx, {
    health_worker_id: health_worker.id,
    country,
    role,
    specialty
  });
  assert(health_worker.first_names);
  assert(health_worker.name);
  assert(health_worker.surname);
  assert(health_worker.preferred_name);
  return {
    ...health_worker,
    organization_id,
    employee_id,
    calendars,
    ...asNames(health_worker)
  };
}
function randomDateOfBirth(age_determination = "adult") {
  const now = /* @__PURE__ */ new Date();
  const year_bounds = yearBounds();
  const age_years = year_bounds.min + Math.random() * (year_bounds.max - year_bounds.min);
  const milliseconds_per_year = 365.25 * 24 * 60 * 60 * 1e3;
  const date_of_birth = new Date(now.getTime() - age_years * milliseconds_per_year);
  return date_of_birth.toISOString().slice(0, 10);
  function yearBounds() {
    switch (age_determination) {
      case "adult":
        return {
          min: 12,
          max: 80
        };
      case "older child":
        return {
          min: 3,
          max: 11.99
        };
      case "younger child":
        return {
          min: 0.01,
          max: 2.99
        };
    }
  }
}
function randomDigit() {
  return Math.floor(Math.random() * 10);
}
function randomDigits(length) {
  return Array.from({
    length
  }, randomDigit).join("");
}
function randomLetter() {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
}
function randomNationalId({
  country,
  sex,
  date_of_birth
}) {
  switch (country || "ZA") {
    case "ZA": {
      const {
        year,
        month,
        day
      } = parseDate(date_of_birth);
      const date_portion = `${year.slice(-2)}${month}${day}`;
      const first_sex_digit = sex === "male" ? sample([5, 6, 7, 8, 9]) : sample([0, 1, 2, 3, 4]);
      const other_sex_digits = randomDigits(3);
      const permanent_resident_digit = sample([0, 1]);
      const last_digit = randomDigits(1);
      const first_twelve = `${date_portion}${first_sex_digit}${other_sex_digits}${permanent_resident_digit}${last_digit}`;
      const checksum = mod10CheckDigit(first_twelve);
      return `${first_twelve}${checksum}`;
    }
    case "ZW":
      return `${randomDigits(2)}-${randomDigits(7)} ${randomLetter()} ${randomDigits(2)}`;
  }
}
function randomDemographics(country = "ZA", sex, age_determination) {
  const date_of_birth = randomDateOfBirth(age_determination);
  const names_and_sex = randomNamesAndSex(country);
  const national_id_number = randomNationalId({
    country,
    date_of_birth,
    sex: names_and_sex.sex
  });
  return {
    ...names_and_sex,
    date_of_birth,
    national_id_number,
    country,
    gender: names_and_sex.sex === "female" ? "woman" : "man",
    preferred_language_code_iso_639_2_b: isKeyOf(country, OFFICIAL_LANGUAGES) ? sample(Array.from(OFFICIAL_LANGUAGES[country])) : "eng"
  };
}
async function insertRegistrationWithEmployeeForTest(trx, organization_id, {
  employment_id,
  is_tutorial
}) {
  assert(Deno.env.get("IS_TEST") || is_tutorial);
  const {
    organization,
    health_worker
  } = await promiseProps({
    organization: organizations.getById(trx, organization_id),
    health_worker: health_workers.getEmployed(trx, {
      health_worker_id: healthWorkerIdOfEmploymentId(trx, employment_id)
    })
  });
  const organization_employment = health_worker.organizations.find((o) => o.id === organization_id);
  assert(organization_employment, "No organization_employment");
  const result = await patient_registration.start(trx, organization, organization_employment);
  return {
    ...result,
    organization,
    organization_employment,
    health_worker
  };
}
function completeAllStepsForTest(trx, workflow, patient_workflow_id, is_tutorial) {
  assert(Deno.env.get("IS_TEST") || is_tutorial);
  const steps = WORKFLOW_STEPS[workflow];
  const insert = steps.map((step) => ({
    patient_workflow_id,
    workflow_step: workflowStepKey(workflow, step)
  }));
  return trx.insertInto("patient_workflow_steps_completed").values(insert).execute();
}
async function insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(trx, organization_id, {
  employment_id,
  patient_demographics,
  is_tutorial
} = {}) {
  if (!organization_id) {
    const created_organization = await createTestOrganization(trx);
    organization_id = created_organization.id;
  }
  if (!employment_id) {
    const created_employee = await addTestEmployee(trx, {
      organization_id
    });
    employment_id = created_employee.employee_id;
  }
  const {
    patient_id,
    patient_workflow_id,
    patient_encounter_id,
    organization,
    organization_employment,
    health_worker,
    success
  } = await insertRegistrationWithEmployeeForTest(trx, organization_id, {
    employment_id,
    is_tutorial
  });
  assert(success, "Nope!");
  const patient_information = randomDemographics();
  if (patient_demographics) {
    Object.assign(patient_information, patient_demographics);
  }
  await Promise.all([patients.update(trx, {
    id: patient_id,
    ...patient_information,
    completed_registration: true
  }), completeAllStepsForTest(trx, "registration", patient_workflow_id, is_tutorial), patient_workflows.completedWorkflow(trx, {
    patient_workflow_id
  }), patient_encounters.updateOne(trx, patient_encounter_id, {
    reason: "seeking treatment"
  })]);
  await patient_encounters.insertSeekingTreatmentForRegisteredPatient(trx, organization, organization_employment, {
    patient_id,
    encounter: {
      create: false,
      patient_encounter_id,
      existing: await patient_encounters.getById(trx, patient_encounter_id)
    }
  });
  const encounter = await patient_encounters.getById(trx, patient_encounter_id);
  assertEquals(encounter.all_employees_seen.length, 1);
  return {
    ...encounter,
    patient_id: encounter.patient.id,
    employee: encounter.all_employees_seen[0],
    organization_employment,
    organization,
    health_worker
  };
}
const $$_tpl_3 = ['Set up my triage demo<span aria-hidden="true">  →</span>'];
const $$_tpl_2 = ['<div class="flex">', "</div>"];
const $$_tpl_1 = ['<div class="py-12 overflow-hidden bg-white"><div class="px-6 mx-auto max-w-7xl lg:flex lg:px-8"><div class="grid max-w-2xl grid-cols-1 mx-auto gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8"><div class="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">', '<p class="mt-6 text-xl leading-8 text-gray-600">We&#39;ll set up a test clinic for you with three patients already in the waiting room — ready for triage.</p>', '</div><div class="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents"><div class="flex-auto w-0 lg:ml-auto lg:w-auto lg:flex-none lg:self-end">', "</div></div></div></div></div>"];
const handler$1 = postHandler(object({}), async (ctx) => {
  const {
    trx
  } = ctx.state;
  const organization = await createTestOrganization(trx);
  const {
    response
  } = await promiseProps({
    response: adSelfAsTriageNurse(),
    adding_receptionist_and_patients: addReceptionistAndPatients(),
    adding_primary_care_nurse: addTestEmployee(trx, {
      role: "nurse",
      specialty: "Primary care",
      organization_id: organization.id
    }).then((primary_care_nurse) => trx.insertInto("employment_presence").values({
      id: primary_care_nurse.employee_id,
      at_work: true
    }).execute())
  });
  return response;
  async function addReceptionistAndPatients() {
    const receptionist = await addTestEmployee(trx, {
      role: "receptionist",
      organization_id: organization.id
    });
    await pMap(range(3), () => insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(trx, organization.id, {
      employment_id: receptionist.employee_id,
      patient_demographics: {
        date_of_birth: "1990-01-01"
      },
      is_tutorial: true
    }));
  }
  async function adSelfAsTriageNurse() {
    const full_organization = await organizations_with_departments.getById(trx, organization.id);
    const department_ids = organizationDepartmentIdsOfProfession(full_organization, "nurse", "Triage");
    const health_worker = await addTestEmployee(trx, {
      specialty: "Triage"
    });
    const session_id = await sessions.insertOne(trx, {
      entity_type: "health_worker",
      entity_id: health_worker.id
    });
    const result = await employment.addOne(trx, {
      department_ids,
      organization_id: organization.id,
      role: "nurse",
      health_worker_id: health_worker.id,
      is_admin: false
    });
    assert(result.id);
    await Promise.all([health_worker_licences.insertTest(trx, {
      health_worker_id: result.health_worker_id,
      country: SERVER_COUNTRY,
      role: "nurse",
      specialty: "Triage"
    }), trx.insertInto("employment_presence").values({
      id: result.id,
      at_work: true
    }).execute()]);
    const response2 = redirect(`/app/organizations/${organization.id}/waiting_room`);
    setCookie(response2.headers, {
      name: session_key,
      value: session_id
    });
    setCookie(response2.headers, {
      name: "health_worker_id",
      value: health_worker.id
    });
    return response2;
  }
});
function TestingTriageOnboardingPage(ctx) {
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Virtual Hospitals Africa",
    children: a($$_tpl_1, u(PageHeader, {
      className: "h1",
      children: "Welcome to VHA Triage!"
    }), u(Form, {
      method: "POST",
      className: "mt-10",
      children: a($$_tpl_2, u(Button, {
        type: "submit",
        children: a($$_tpl_3)
      }))
    }), u("img", {
      src: "/doctor-holding-phone.png",
      alt: "Welcome",
      class: "aspect-7/5 w-148 max-w-none rounded-2xl bg-gray-50 object-cover"
    }))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___testing_triage_onboarding_index = TestingTriageOnboardingPage;
export {
  config,
  css,
  _freshRoute___testing_triage_onboarding_index as default,
  handler,
  handlers
};
