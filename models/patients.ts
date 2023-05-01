import db from "../external-clients/db.ts";
import {
  ConversationState,
  Gender,
  Maybe,
  Patient,
  ReturnedSqlRow,
  TrxOrDb,
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

export async function upsert(trx: TrxOrDb, info: {
  conversation_state: Maybe<ConversationState>;
  phone_number: string;
  name: Maybe<string>;
  gender: Maybe<Gender>;
  date_of_birth: Maybe<string>;
  national_id_number: Maybe<string>;
}): Promise<ReturnedSqlRow<Patient>> {
  const [patient] = await trx
    .insertInto("patients")
    .values(info)
    .onConflict((oc) => oc.column("phone_number").doUpdateSet(info))
    .returningAll()
    .execute();

  return patient;
}

export function remove(opts: { phone_number: string }) {
  return db
    .deleteFrom("patients")
    .where("phone_number", "=", opts.phone_number)
    .execute();
}
