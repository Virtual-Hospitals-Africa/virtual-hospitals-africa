import { assertEquals } from "std/testing/asserts.ts";
import { prettyPatientDateOfBirth } from "../util/date.ts";

Deno.test("prettyPatientDateOfBirth", () => {
  const dob = prettyPatientDateOfBirth({
    date_of_birth: "1990-03-01",
  } as any);
  assertEquals(dob, "March 1, 1990");
});
