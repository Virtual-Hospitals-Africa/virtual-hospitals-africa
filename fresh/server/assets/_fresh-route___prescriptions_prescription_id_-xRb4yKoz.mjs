import { aU as base, bQ as formatRecord, bA as patient_procedures, a, b as s, m as assert, v as assertOr400, d as db, bC as patient_record_providers, e as assertOr404, a2 as promiseProps, p as patients, u, l } from "../server-entry.mjs";
import { J as JustLogoLayout } from "./JustLogoLayout-CBo8Mo4Y.mjs";
import { p as patient_contacts } from "./patient_contacts-2xifl8zO.mjs";
import { h as healthWorkerIdOfEmploymentId } from "./health_worker_id-B810p7q_.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./Footer-CjAnK5R7.mjs";
const patient_prescriptions = base({
  top_level_table: "patient_prescription_signatures",
  baseQuery(trx, opts) {
    return patient_procedures.baseQuery(trx, opts).innerJoin("patient_prescription_signatures", "patient_procedures.id", "patient_prescription_signatures.id").select((eb) => [eb.selectFrom("patient_prescription_redemption_codes").whereRef("patient_prescription_signature_id", "=", "patient_prescription_signatures.id").select("patient_prescription_redemption_codes.alphanumeric_code").as("alphanumeric_code")]);
  },
  formatResult: formatRecord
});
const $$_tpl_1$1 = ['<div class="mb-4 w-1/2"><p class="text-purple-900 font-semibold">', "</p><p>", "</p></div>"];
function PrescriptionDetail({
  heading,
  information
}) {
  if (!information) return null;
  return a($$_tpl_1$1, s(heading), s(information));
}
const $$_tpl_1 = ['<div class="flex items-center mb-4"><div class="flex-1 h-4 bg-red-400"></div><div class="flex-1 h-4 bg-orange-200"></div></div>'];
const $$_tpl_2 = ['<div class="flex items-center justify-center pt-20 pb-20 font-sans bg-gray-100"><div class="p-5 bg-white" ', '><div class="pt-5 mb-2 text-3xl font-extrabold text-center text-purple-900"><h1>PRESCRIPTION</h1></div>', '<div class="mb-2"><div class="flex justify-between">', "", "</div></div>", '<div class="mb-2"><div class="mb-2 font-bold text-purple-900">Patient Information</div><div>', "", "", "", "", "", "</div></div>", '<div class="mb-2 font-bold text-purple-900">List of Prescribed Medications</div>', '<div class="mb-2 font-bold text-purple-900">Physician Information</div><div class="mt-3 mb-3"><div></div></div></div></div>'];
function Divider() {
  return a($$_tpl_1);
}
async function PrescriptionPage(ctx) {
  assert(!ctx.state.db, "Assuming transaction wasn't already started");
  const {
    searchParams
  } = ctx.url;
  const code = searchParams.get("code");
  assertOr400(code, "code is required");
  const prescription_raw = await patient_prescriptions.getById(db, ctx.params.prescription_id);
  const [prescription] = await patient_record_providers.hydrateIntermediateRecords(db, {
    records: [prescription_raw],
    health_worker_id: healthWorkerIdOfEmploymentId(db, prescription_raw.employment_id)
  });
  assertOr404(prescription.alphanumeric_code, "No redemption code available for that prescription");
  assertOr404(prescription.alphanumeric_code === code, "Could not find that prescription");
  const {
    patient_id
  } = prescription;
  assert(patient_id, "Patient ID is required");
  const {
    patient,
    contacts
  } = await promiseProps({
    patient: patients.getById(db, patient_id, {
      include_incomplete_registration: false
    }),
    contacts: patient_contacts.get(db, {
      patient_id
    })
  });
  return u(JustLogoLayout, {
    url: ctx.url,
    title: "Prescription",
    children: a($$_tpl_2, l("style", {
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
    }), u(Divider, null), u(PrescriptionDetail, {
      heading: "Prescription No.",
      information: prescription.id
    }), u(PrescriptionDetail, {
      heading: "Prescription Date",
      information: new Date(prescription.created_at).toLocaleDateString()
    }), u(Divider, null), u(PrescriptionDetail, {
      heading: "Name",
      information: patient.name
    }), u(PrescriptionDetail, {
      heading: "Age",
      information: patient.age_display
    }), u(PrescriptionDetail, {
      heading: "Phone Number",
      information: contacts?.phone_number
    }), u(PrescriptionDetail, {
      heading: "Date of Birth",
      information: patient.dob_formatted
    }), u(PrescriptionDetail, {
      heading: "Sex",
      information: patient.sex
    }), u(PrescriptionDetail, {
      heading: "Address",
      information: contacts?.formatted_address
    }), u(Divider, null), u(Divider, null))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___prescriptions_prescription_id_ = PrescriptionPage;
export {
  config,
  css,
  _freshRoute___prescriptions_prescription_id_ as default,
  handler,
  handlers
};
