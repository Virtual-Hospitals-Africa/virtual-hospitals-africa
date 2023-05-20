// TODO: Instead of using a timer, refresh the token on demand.
// Perhaps we do this as well so that users don't have to wait for the token to be refreshed.a
import db from "../db/db.ts";
import { refreshTokens } from "../external-clients/google.ts";
import { allWithGoogleTokensAboutToExpire } from "../db/models/doctors.ts";

export type TokenRefresher = { start(): void; exit(): void };

export function createTokenRefresher(): TokenRefresher {
  let timer: number;

  async function doRefreshTokens(): Promise<void> {
    const doctors = await allWithGoogleTokensAboutToExpire(db);
    await Promise.all(doctors.map(doctor => refreshTokens(db, doctor)));
    timer = setTimeout(doRefreshTokens, 3 * 60 * 1000);
  }

  return {
    start: doRefreshTokens,
    exit(): void {
      console.log("Exiting tokenRefresher");
      clearTimeout(timer);
    },
  };
}

createTokenRefresher().start();
