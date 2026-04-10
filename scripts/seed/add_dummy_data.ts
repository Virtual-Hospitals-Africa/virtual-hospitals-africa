import { TEST_ORGANIZATION_UUIDS } from "test/_helpers/organizations.ts";
import db from "../../db/db.ts";
import { addTestEmployee } from "../../mocks/testEmployee.ts";

/**
 * Add basic dummy data to the database for development/testing
 */
async function addDummyData() {
  console.log("Adding dummy health workers...");

  // Add a receptionist
  const receptionist = await addTestEmployee(db, {
    role: "receptionist",
    organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
  });
  console.log(
    `Added receptionist: ${receptionist.first_names} ${receptionist.surname}`,
  );

  // Add a nurse
  const nurse = await addTestEmployee(db, {
    role: "nurse",
    organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    specialty: "Primary care",
  });
  console.log(`Added nurse: ${nurse.first_names} ${nurse.surname}`);

  // Add a doctor
  const doctor = await addTestEmployee(db, {
    role: "doctor",
    organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
    specialty: "Emergency Medicine",
  });
  console.log(`Added doctor: ${doctor.first_names} ${doctor.surname}`);

  // Add an admin
  const admin = await addTestEmployee(db, {
    role: "admin",
    organization_id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
  });
  console.log(`Added admin: ${admin.first_names} ${admin.surname}`);

  console.log("Dummy data added successfully!");
}

if (import.meta.main) {
  await addDummyData();
  Deno.exit(0);
}
