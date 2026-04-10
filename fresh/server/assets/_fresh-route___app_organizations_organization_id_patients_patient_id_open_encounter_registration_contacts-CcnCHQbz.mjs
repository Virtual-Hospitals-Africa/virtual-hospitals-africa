import { v as assertOr400, an as addresses, O as OpenEncounterWorkflowPage, e as assertOr404, a1 as completeAndProceedToNextStep, F as object, ao as array, ap as international_phone_number, G as string, a, u, aq as EmergencyContactSection, al as SERVER_COUNTRY, ar as PatientContactInformationSection, as as EmergencyContactSchema } from "../server-entry.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import { p as patient_contacts } from "./patient_contacts-2xifl8zO.mjs";
import { g as getPlaceDetails } from "./google-maps-CUZxBdxq.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
import "./addresses-DYgdsFAd.mjs";
const patient_emergency_contacts = {
  getByPatientId(trx, {
    patient_id
  }) {
    return trx.selectFrom("patient_emergency_contacts").select(["id", "name", "relationship", "phone_number", "contact_order"]).where("patient_id", "=", patient_id).orderBy("contact_order", "asc").orderBy("created_at", "asc").execute();
  },
  getPrimaryContact(trx, {
    patient_id
  }) {
    return trx.selectFrom("patient_emergency_contacts").select(["id", "name", "relationship", "phone_number", "contact_order"]).where("patient_id", "=", patient_id).where("contact_order", "=", 0).executeTakeFirst();
  },
  async addContact(trx, {
    patient_id,
    name,
    relationship,
    phone_number,
    contact_order = 0
  }) {
    assertOr400(phone_number.length > 0, "Phone number is required");
    assertOr400(name.trim().length > 0, "Contact name is required");
    if (contact_order !== void 0) {
      await trx.updateTable("patient_emergency_contacts").where("patient_id", "=", patient_id).where("contact_order", "=", contact_order).set({
        contact_order: contact_order + 1
      }).execute();
    }
    return trx.insertInto("patient_emergency_contacts").values({
      patient_id,
      name: name.trim(),
      relationship,
      phone_number,
      contact_order
    }).returningAll().executeTakeFirstOrThrow();
  },
  async updateContact(trx, {
    id,
    patient_id,
    name,
    relationship,
    phone_number,
    contact_order
  }) {
    if (contact_order !== void 0) {
      await trx.updateTable("patient_emergency_contacts").where("patient_id", "=", patient_id).where("id", "!=", id).where("contact_order", "=", contact_order).set({
        contact_order: contact_order + 1
      }).execute();
    }
    const updates = {};
    if (name !== void 0) updates.name = name.trim();
    if (relationship !== void 0) updates.relationship = relationship;
    if (phone_number !== void 0) updates.phone_number = phone_number;
    if (contact_order !== void 0) updates.contact_order = contact_order;
    assertOr400(Object.keys(updates).length > 0, "No fields to update");
    return trx.updateTable("patient_emergency_contacts").where("id", "=", id).where("patient_id", "=", patient_id).set(updates).returningAll().executeTakeFirstOrThrow();
  },
  removeContact(trx, {
    id,
    patient_id
  }) {
    return trx.deleteFrom("patient_emergency_contacts").where("id", "=", id).where("patient_id", "=", patient_id).executeTakeFirstOrThrow();
  },
  async setContacts(trx, {
    patient_id,
    contacts: contacts2
  }) {
    assertOr400(contacts2.length > 0, "At least one emergency contact is required");
    await trx.deleteFrom("patient_emergency_contacts").where("patient_id", "=", patient_id).execute();
    return trx.insertInto("patient_emergency_contacts").values(contacts2.map((contact, idx) => ({
      patient_id,
      name: contact.name.trim(),
      relationship: contact.relationship,
      phone_number: contact.phone_number,
      contact_order: contact.contact_order ?? idx
    }))).returningAll().execute();
  }
};
const patient_address = {
  getByPatientId(trx, {
    patient_id
  }) {
    return trx.selectFrom("patients").innerJoin("addresses", "addresses.id", "patients.address_id").where("patients.id", "=", patient_id).selectAll("addresses").executeTakeFirst();
  },
  async updateByPatientId(trx, {
    patient_id,
    address
  }) {
    const created_address = await addresses.insert(trx, address);
    await trx.updateTable("patients").where("patients.id", "=", patient_id).set("address_id", created_address.id).executeTakeFirstOrThrow();
  }
};
const $$_tpl_1 = ["", "", ""];
const PatientRegistrationContactsSchema = object({
  google_maps_place_id: string(),
  phone_number: international_phone_number.optional(),
  emergency_contacts: array(EmergencyContactSchema).min(1)
});
const handler$1 = postHandler(PatientRegistrationContactsSchema, async (ctx, {
  google_maps_place_id,
  phone_number,
  emergency_contacts
}) => {
  await Promise.all([patient_emergency_contacts.setContacts(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    contacts: emergency_contacts
  }), getPlaceDetails(google_maps_place_id).then((address) => {
    assertOr404(address, `No google maps place exists with id ${google_maps_place_id}`);
    return patient_address.updateByPatientId(ctx.state.trx, {
      patient_id: ctx.state.patient.id,
      address: addresses.insertValues({
        ...address,
        google_maps_place_id
      })
    });
  }), patient_contacts.updatePhoneNumber(ctx.state.trx, {
    patient_id: ctx.state.patient.id,
    phone_number
  })]);
  return completeAndProceedToNextStep(ctx);
});
async function PatientRegistrationContactsPage(ctx) {
  const address = await patient_address.getByPatientId(ctx.state.trx, {
    patient_id: ctx.state.patient.id
  });
  const existing_contacts = await patient_emergency_contacts.getByPatientId(ctx.state.trx, {
    patient_id: ctx.state.patient.id
  });
  const patient_phone = (await patient_contacts.get(ctx.state.trx, {
    patient_id: ctx.state.patient.id
  }))?.phone_number ?? void 0;
  return a($$_tpl_1, u(PatientContactInformationSection, {
    address,
    default_country: SERVER_COUNTRY,
    phone_number: patient_phone,
    organization_id: ctx.state.organization.id
  }), u(EmergencyContactSection, {
    existing_contacts
  }));
}
const contacts = OpenEncounterWorkflowPage(PatientRegistrationContactsPage);
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_contacts = contacts;
export {
  config,
  css,
  _freshRoute___app_organizations_organization_id_patients_patient_id_open_encounter_registration_contacts as default,
  handler,
  handlers
};
