import { H as HealthWorkerHomePage, k as patient_encounters, ad as generateUUID, r as redirect, e as assertOr404, a2 as promiseProps, p as patients, u, di as AddPatientForm, z } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { e as employees_presence } from "./employees_presence-3gMzve44.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./organizations-DBMxrctL.mjs";
import "./addresses-DYgdsFAd.mjs";
const AddPatientFormSchema = z.object({
  patient_id: z.string().uuid(),
  reason: z.enum(["seeking treatment", "maternity", "follow up", "referral", "checkup"]),
  notes: z.string().optional()
});
const handler$1 = postHandler(AddPatientFormSchema, async ({
  state: {
    trx,
    organization,
    organization_employment
  }
}, {
  patient_id,
  ...to_create
}) => {
  const inserted = await patient_encounters.insertSeekingTreatmentForRegisteredPatient(trx, organization, organization_employment, {
    patient_id,
    encounter: {
      create: true,
      to_create,
      patient_encounter_id: generateUUID()
    }
  });
  return redirect(`/app/organizations/${organization.id}/waiting_room?just_encountered_patient_id=${inserted.id}`);
});
const add = HealthWorkerHomePage("Add patient to waiting room", async function WaitingRoomAdd({
  url,
  state: {
    trx,
    organization,
    organization_id,
    health_worker_id
  }
}) {
  const {
    searchParams
  } = url;
  const patient_id = searchParams.get("patient_id");
  assertOr404(patient_id, "Must add a specific patient");
  const {
    patient,
    providers,
    open_encounter
  } = await promiseProps({
    patient: patients.getById(trx, patient_id, {
      include_incomplete_registration: true
    }),
    providers: employees_presence.findAll(trx, {
      organization_id,
      excluding_health_worker_id: health_worker_id
    }),
    open_encounter: patient_encounters.getFirstOpen(trx, {
      patient_id
    })
  });
  if (open_encounter) {
    const warning = encodeURIComponent("Please use the existing patient visit.");
    return redirect(`/app/organizations/${organization.id}/waiting_room?warning=${warning}`);
  }
  return u(AddPatientForm, {
    providers,
    patient
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_waiting_room_add = add;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_waiting_room_add as default,
  handler,
  handlers
};
