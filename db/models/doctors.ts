import { DeleteResult, sql, UpdateResult } from "kysely";
import isDate from "../../util/isDate.ts";
import {
  DoctorWithGoogleTokens,
  GoogleTokens,
  Maybe,
  TrxOrDb,
} from "../../types.ts";

type DoctorDetails = {
  name: string;
  email: string;
  gcal_appointments_calendar_id: string;
  gcal_availability_calendar_id: string;
};

// Shave a minute so that we refresh too early rather than too late
const expiresInAnHourSql = sql<
  Date
>`(SELECT now() + (59 * interval '1 minute'))`;

export async function upsert(
  trx: TrxOrDb,
  details: DoctorDetails,
): Promise<{
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string;
  gcal_appointments_calendar_id: string;
  gcal_availability_calendar_id: string;
}> {
  const [doctor] = await trx
    .insertInto("doctors")
    .values(details)
    .onConflict((oc) => oc.column("email").doUpdateSet(details))
    .returningAll()
    .execute();

  return doctor;
}

export async function upsertWithGoogleCredentials(
  trx: TrxOrDb,
  details: DoctorDetails & GoogleTokens,
): Promise<{
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string;
  gcal_appointments_calendar_id: string;
  gcal_availability_calendar_id: string;
}> {
  const doctor = await upsert(
    trx,
    {
      name: details.name,
      email: details.email,
      gcal_appointments_calendar_id: details.gcal_appointments_calendar_id,
      gcal_availability_calendar_id: details.gcal_availability_calendar_id,
    },
  );

  await trx
    .insertInto("doctor_google_tokens")
    .values({
      doctor_id: doctor.id,
      access_token: details.access_token,
      refresh_token: details.refresh_token,
      expires_at: details.expires_at,
    })
    .onConflict((oc) =>
      oc.column("doctor_id").doUpdateSet({
        access_token: details.access_token,
        refresh_token: details.refresh_token,
        expires_at: details.expires_at,
      })
    )
    .execute();

  return doctor;
}

const getWithTokensQuery = (trx: TrxOrDb) =>
  trx
    .selectFrom("doctors")
    .leftJoin(
      "doctor_google_tokens",
      "doctors.id",
      "doctor_google_tokens.doctor_id",
    )
    .selectAll("doctors")
    .select("doctor_google_tokens.access_token")
    .select("doctor_google_tokens.refresh_token")
    .where("doctor_google_tokens.access_token", "is not", null)
    .where("doctor_google_tokens.refresh_token", "is not", null);

// TODO: Store auth tokens in a way that we can more easily refresh them and find the ones for a specific doctor
export async function getAllWithTokens(
  trx: TrxOrDb,
): Promise<DoctorWithGoogleTokens[]> {
  const result = await getWithTokensQuery(trx).execute();
  return withTokens(result);
}

export function isDoctorWithGoogleTokens(
  doctor: unknown,
): doctor is DoctorWithGoogleTokens {
  return !!doctor &&
    typeof doctor === "object" &&
    "access_token" in doctor && typeof doctor.access_token === "string" &&
    "refresh_token" in doctor && typeof doctor.refresh_token === "string" &&
    "expires_at" in doctor && (typeof doctor.expires_at === "string" || isDate(doctor.expires_at)) &&
    "id" in doctor && typeof doctor.id === "number" &&
    "name" in doctor && typeof doctor.name === "string" &&
    "email" in doctor && typeof doctor.email === "string" &&
    "gcal_appointments_calendar_id" in doctor &&
    typeof doctor.gcal_appointments_calendar_id === "string" &&
    "gcal_availability_calendar_id" in doctor &&
    typeof doctor.gcal_availability_calendar_id === "string";
}

function withTokens(doctors: unknown[]) {
  const withTokens: DoctorWithGoogleTokens[] = [];
  for (const doctor of doctors) {
    if (!isDoctorWithGoogleTokens(doctor)) {
      throw new Error("Doctor has no access token or refresh token");
    }
    withTokens.push(doctor);
  }
  return withTokens;
}

export async function getAllWithExtantTokens(trx: TrxOrDb): Promise<
  DoctorWithGoogleTokens[]
> {
  return withTokens(await getAllWithTokens(trx));
}

export async function getWithTokensById(
  trx: TrxOrDb,
  doctor_id: number,
): Promise<Maybe<DoctorWithGoogleTokens>> {
  const [doctor] = await getWithTokensQuery(trx).where(
    "doctors.id",
    "=",
    doctor_id,
  )
    .execute();
  return withTokens([doctor])[0];
}

export async function allWithGoogleTokensAboutToExpire(trx: TrxOrDb): Promise<
  DoctorWithGoogleTokens[]
> {
  return withTokens(
    await getWithTokensQuery(trx).where(
      "doctor_google_tokens.expires_at",
      "<",
      sql`now() + (5 * interval '1 minute')`,
    ).execute(),
  );
}

export function updateAccessToken(
  trx: TrxOrDb,
  doctor_id: number,
  access_token: string,
): Promise<UpdateResult[]> {
  return trx
    .updateTable("doctor_google_tokens")
    .where("doctor_id", "=", doctor_id)
    .set({ access_token, expires_at: expiresInAnHourSql })
    .execute();
}

export function removeExpiredAccessToken(
  trx: TrxOrDb,
  opts: { doctor_id: number },
): Promise<DeleteResult[]> {
  return trx.deleteFrom("doctor_google_tokens").where(
    "doctor_id",
    "=",
    opts.doctor_id,
  ).execute();
}
