import { assertEquals } from "std/testing/asserts.ts";
import { PatientDemographicInfo } from "../types.ts";
import { prettyPatientDateOfBirth } from "../util/date.ts";

Deno.test("prettyPatientDateOfBirth", () => {
  const dob = prettyPatientDateOfBirth({
    date_of_birth: "1990-03-01",
  } as PatientDemographicInfo);
  assertEquals(dob, "March 1, 1990");
});
