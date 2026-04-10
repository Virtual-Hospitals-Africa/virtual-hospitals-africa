import { b0 as asResult, m as assert, v as assertOr400, b1 as parseDate } from "../server-entry.mjs";
function mod10CheckDigit(number) {
  assert(number.length === 12);
  let doubled_sum = 0;
  for (const [index, digit] of number.split("").entries()) {
    const int = parseInt(digit, 10);
    assert(!isNaN(int));
    if (index % 2 === 0) {
      doubled_sum += int;
    } else {
      const double = int * 2;
      doubled_sum += double > 9 ? double - 9 : double;
    }
  }
  return doubled_sum * 9 % 10;
}
function validateSouthAfricanNationalIdNumber({
  sex,
  date_of_birth,
  national_id_number
}) {
  assertOr400(national_id_number.length === 13, "National ID number must be 13 digits");
  assertOr400(/^\d{2}[0-1][0-9][0-3]\d\d{4}[0-1]\d{2}$/.test(national_id_number), "National ID number must be 13 digits");
  const dob = parseDate(date_of_birth);
  const check_dob = national_id_number.substring(0, 6);
  assertOr400(check_dob === `${dob.year.slice(-2)}${dob.month}${dob.day}`, "Date of birth must match the date of birth in the national ID number");
  const check_sex = parseInt(national_id_number.substring(6, 10));
  switch (sex) {
    case "male":
      assertOr400(check_sex >= 5e3 && check_sex <= 9999, "The provided sex does not match the sex in the national ID number. Expected 5000-9999, but received " + check_sex);
      break;
    case "female":
      assertOr400(check_sex >= 0 && check_sex <= 4999, "The provided sex does not match the sex in the national ID number. Expected 0000-4999, but received " + check_sex);
      break;
  }
  const to_validate = national_id_number.slice(0, 12);
  const last_digit = national_id_number[12];
  assert(last_digit);
  const last_int = parseInt(last_digit, 10);
  assert(!isNaN(last_int));
  const check_sum = mod10CheckDigit(to_validate);
  assertOr400(check_sum === last_int, "The national ID number is invalid. Please check that it was entered correctly and try again");
}
function nationalIdCheckResult(opts) {
  return asResult(() => validateSouthAfricanNationalIdNumber(opts));
}
export {
  mod10CheckDigit as m,
  nationalIdCheckResult as n
};
