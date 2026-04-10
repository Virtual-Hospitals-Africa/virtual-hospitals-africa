import { p as patient_new_encounters } from "./patient_new_encounters-aQfRoZZN.mjs";
const patient_new = {
  create(trx, values) {
    return patient_new_encounters.create(trx, {
      patient: {
        create: true
      },
      ...values
    });
  }
};
export {
  patient_new as p
};
