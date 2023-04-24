import db from "../db.ts";
import {
  ConversationState,
  Gender,
  Maybe,
  Patient,
  ReturnedSqlRow,
} from "../types.ts";

export async function getByPhoneNumber(
  query: { phone_number: string },
): Promise<
  Maybe<ReturnedSqlRow<Patient>>
> {
  const result = await db
    .selectFrom("patients")
    .selectAll()
    .where("phone_number", "=", query.phone_number)
    .execute();
  return result && result[0];
}

export async function upsert(info: {
  conversation_state: Maybe<ConversationState>;
  phone_number: string;
  name: Maybe<string>;
  gender: Maybe<Gender>;
  date_of_birth: Maybe<string>;
  national_id_number: Maybe<string>;
}): Promise<ReturnedSqlRow<Patient>> {
  const [patient] = await db
    .insertInto("patients")
    .values(info)
    .onConflict((oc) => oc.column("phone_number").doUpdateSet(info))
    .returningAll()
    .execute();

  return patient;
}
