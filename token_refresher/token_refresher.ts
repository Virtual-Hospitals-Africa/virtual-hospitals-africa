// TODO: Instead of using a timer, refresh the token on demand.
// Perhaps we do this as well so that users don't have to wait for the token to be refreshed.a
import db from '../db/db.ts'
import { refreshTokens } from '../external-clients/google.ts'
import * as google_tokens from '../db/models/google_tokens.ts'

export type token_refresher = { start(): void; exit(): void }

export function createtoken_refresher(): token_refresher {
  let timer: number

  async function doRefreshTokens(): Promise<void> {
    const tokens_about_to_expire = await google_tokens.getAllAboutToExpire(db)
    await Promise.all(
      tokens_about_to_expire.map((token) => {
        if (token.entity_type === 'health_worker') {
          return refreshTokens(db, {
            id: token.entity_id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
          })
        }
        // For now, we only handle health_worker tokens, but this can be extended for regulators if needed
        return Promise.resolve()
      }),
    )
    timer = setTimeout(doRefreshTokens, 3 * 60 * 1000)
  }

  return {
    start: doRefreshTokens,
    exit(): void {
      console.log('Exiting token_refresher')
      clearTimeout(timer)
    },
  }
}

createtoken_refresher().start()
