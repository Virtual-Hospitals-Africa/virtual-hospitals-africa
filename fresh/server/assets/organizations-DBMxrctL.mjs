import { ad as generateUUID, aW as organizations } from "../server-entry.mjs";
import { f as formatAddress } from "./addresses-DYgdsFAd.mjs";
const TEST_ORGANIZATION_UUIDS = {
  ZA: {
    hospital: "00000000-0000-1000-8000-000000000002"
  }
};
function testOrganizationRoomNames(department) {
  switch (department) {
    case "Primary care":
      return ["Primary care room 101", "Primary care room 102"];
    case "Maternity":
      return ["Maternity room 1"];
    case "Immunizations":
      return ["Immunizations room 1"];
    case "Chronic diseases":
      return ["Chronic diseases room 1"];
    case "Reception":
      return ["Reception"];
    case "Oncology":
      return ["Oncology room 1"];
    case "Burns":
      return ["Burns room 1"];
    case "Remote care":
      return ["Remote care room 1"];
    case "Waiting room":
      return ["Waiting room"];
    case "Triage":
      return ["Triage room 1", "Triage room 2"];
    case "Administration":
      return ["Administration"];
    case "Pharmacy":
      return ["Pharmacy"];
    case "Emergency":
      return ["Resuscitation area"];
    default:
      throw new Error(`Unrecognized department ${department}`);
  }
}
function testOrganizationDepartments(category) {
  return category === "Clinic" ? ["Primary care", "Maternity", "Immunizations", "Chronic diseases", "Reception", "Waiting room", "Triage", "Administration", "Pharmacy", "Emergency"] : ["Primary care", "Oncology", "Burns", "Reception", "Waiting room", "Triage", "Administration", "Pharmacy", "Remote care", "Emergency"];
}
function createTestOrganization(trx, {
  id,
  category = "Clinic"
} = {}) {
  const organization = {
    id,
    category,
    name: `Test ${generateUUID()} ${category}`,
    country: "ZA",
    departments: testOrganizationDepartments(category).map((name) => ({
      name,
      room_names: testOrganizationRoomNames(name)
    })),
    address: formatAddress({
      street: "123 Test St",
      locality: "Test City",
      country: "ZA",
      postal_code: "12345"
    }),
    location: {
      latitude: 0,
      longitude: 0
    }
  };
  return organizations.add(trx, organization);
}
export {
  TEST_ORGANIZATION_UUIDS as T,
  createTestOrganization as c
};
