// TODO: Instead of using a timer, refresh the token on demand.
// Perhaps we do this as well so that users don't have to wait for the token to be refreshed.a
import db from "../external-clients/db.ts";
import * as google from "../external-clients/google.ts";
import {
  allWithGoogleTokensAboutToExpire,
  removeExpiredAccessToken,
  updateAccessToken,
} from "../models/doctors.ts";

async function doRefreshTokens(): Promise<any> {
  const doctors = await allWithGoogleTokensAboutToExpire(db);

  await Promise.all(doctors.map(async (doctor) => {
    const result = await google.getNewAccessTokenFromRefreshToken(
      doctor.refresh_token,
    );
    if (result.error) {
      console.log("Error refreshing token", result.error_description);
      await removeExpiredAccessToken({ doctor_id: doctor.id });
    } else {
      await updateAccessToken(doctor.id, result.access_token);
    }
  }));
}

export type TokenRefresher = { start(): void; exit(): void };

export function createTokenRefresher(): TokenRefresher {
  let timer: number;

  async function refreshTokens(): Promise<void> {
    await doRefreshTokens();
    timer = setTimeout(refreshTokens, 3 * 60 * 1000);
  }

  return {
    start: refreshTokens,
    exit(): void {
      console.log("Exiting tokenRefresher");
      clearTimeout(timer);
    },
  };
}

createTokenRefresher().start();
