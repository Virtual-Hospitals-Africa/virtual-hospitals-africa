const patient_contacts = {
  get(trx, {
    patient_id
  }) {
    return trx.selectFrom("patients").leftJoin("addresses", "patients.address_id", "addresses.id").select(["patients.phone_number", "addresses.formatted as formatted_address"]).where("patients.id", "=", patient_id).executeTakeFirst();
  },
  updatePhoneNumber(trx, {
    patient_id,
    phone_number
  }) {
    return trx.updateTable("patients").set({
      phone_number: phone_number || null
    }).where("id", "=", patient_id).executeTakeFirst();
  }
};
export {
  patient_contacts as p
};
