import { DeleteResult, sql, Transaction, UpdateResult } from "kysely";
import db, { DatabaseSchema } from "../external-clients/db.ts";
import {
  DoctorWithGoogleTokens,
  DoctorWithPossibleGoogleTokens,
  GoogleTokens,
  Maybe,
} from "../types.ts";

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
  details: DoctorDetails,
  using: Transaction<DatabaseSchema> | typeof db = db,
): Promise<{
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string;
  gcal_appointments_calendar_id: string;
  gcal_availability_calendar_id: string;
}> {
  const [doctor] = await using
    .insertInto("doctors")
    .values(details)
    .onConflict((oc) => oc.column("email").doUpdateSet(details))
    .returningAll()
    .execute();

  return doctor;
}

export function upsertWithGoogleCredentials(
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
  return db.transaction().execute(async (trx) => {
    const doctor = await upsert(
      {
        name: details.name,
        email: details.email,
        gcal_appointments_calendar_id: details.gcal_appointments_calendar_id,
        gcal_availability_calendar_id: details.gcal_availability_calendar_id,
      },
      trx,
    );

    await trx
      .insertInto("doctor_google_tokens")
      .values({
        doctor_id: doctor.id,
        expires_at: new Date(),
        access_token: details.access_token,
        refresh_token: details.refresh_token,
      })
      .onConflict((oc) =>
        oc.column("doctor_id").doUpdateSet({
          access_token: details.access_token,
          refresh_token: details.refresh_token,
        })
      )
      .execute();

    return doctor;
  });
}

const getWithTokensQuery = db
  .selectFrom("doctors")
  .leftJoin(
    "doctor_google_tokens",
    "doctors.id",
    "doctor_google_tokens.doctor_id",
  )
  .selectAll("doctors")
  .select("doctor_google_tokens.access_token")
  .select("doctor_google_tokens.refresh_token");

// TODO: Store auth tokens in a way that we can more easily refresh them and find the ones for a specific doctor
export function getAllWithTokens(): Promise<DoctorWithPossibleGoogleTokens[]> {
  return getWithTokensQuery.execute();
}

function hasTokens(
  doctor: Maybe<DoctorWithPossibleGoogleTokens>,
): doctor is DoctorWithGoogleTokens {
  return !!doctor && !!doctor.access_token && !!doctor.refresh_token;
}

function withTokens(doctors: DoctorWithPossibleGoogleTokens[]) {
  const withTokens: DoctorWithGoogleTokens[] = [];
  for (const doctor of doctors) {
    if (!hasTokens(doctor)) {
      throw new Error("Doctor has no access token or refresh token");
    }
    withTokens.push(doctor);
  }
  return withTokens;
}

export async function getAllWithExtantTokens(): Promise<
  DoctorWithGoogleTokens[]
> {
  return withTokens(await getAllWithTokens());
}

export async function getWithTokensById(
  doctor_id: number,
): Promise<Maybe<DoctorWithPossibleGoogleTokens>> {
  const [doctor] = await getWithTokensQuery.where("doctors.id", "=", doctor_id)
    .execute();
  return doctor;
}

export async function allWithGoogleTokensAboutToExpire(): Promise<
  DoctorWithGoogleTokens[]
> {
  return withTokens(
    await getWithTokensQuery.where(
      "doctor_google_tokens.expires_at",
      "<",
      sql`now() + (5 * interval '1 minute')`,
    ).execute(),
  );
}

export function updateAccessToken(
  doctor_id: number,
  access_token: string,
): Promise<UpdateResult[]> {
  return db
    .updateTable("doctor_google_tokens")
    .where("doctor_id", "=", doctor_id)
    .set({ access_token, expires_at: expiresInAnHourSql })
    .execute();
}

export function removeExpiredAccessToken(
  opts: { doctor_id: number },
): Promise<DeleteResult[]> {
  return db.deleteFrom("doctor_google_tokens").where(
    "doctor_id",
    "=",
    opts.doctor_id,
  ).execute();
}
