// import { map } from 'bluebird'
// import * as google from './google'
// import { allWithGoogleTokensAboutToExpire, updateAccessToken, removeExpiredAccessToken } from './models/doctors'

// async function doRefreshTokens(): Promise<any> {
//   const doctors = await allWithGoogleTokensAboutToExpire()

//   await map(doctors, async doctor => {
//     const result = await google.getNewAccessTokenFromRefreshToken(doctor.refresh_token)
//     if (result.error) {
//       console.log('Error refreshing token', result.error_description)
//       await removeExpiredAccessToken({ doctor_id: doctor.id })
//     } else {
//       await updateAccessToken(doctor.id, result.access_token)
//     }
//   }, { concurrency: 6 })
// }

// export type TokenRefresher = { start(): void, exit(): void }

// export function createTokenRefresher(): TokenRefresher {
//   let timer: NodeJS.Timeout

//   async function refreshTokens(): Promise<void> {
//     await doRefreshTokens()
//     timer = setTimeout(refreshTokens, 100)
//   }

//   return {
//     start: refreshTokens,
//     exit(): void {
//       console.log('Exiting tokenRefresher')
//       clearTimeout(timer)
//     }
//   }
// }
