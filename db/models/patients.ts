import {
  ConversationState,
  Gender,
  Maybe,
  Patient,
  ReturnedSqlRow,
  TrxOrDb,
} from "../../types.ts";

export async function getByPhoneNumber(
  trx: TrxOrDb,
  query: { phone_number: string },
): Promise<
  Maybe<ReturnedSqlRow<Patient>>
> {
  const result = await trx
    .selectFrom("patients")
    .selectAll()
    .where("phone_number", "=", query.phone_number)
    .execute();
  return result && result[0];
}

export async function upsert(trx: TrxOrDb, info: {
  id?: number;
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

export function remove(trx: TrxOrDb, opts: { phone_number: string }) {
  return trx
    .deleteFrom("patients")
    .where("phone_number", "=", opts.phone_number)
    .execute();
}
