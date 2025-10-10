import generateUUID from '../util/uuid.ts'

export default function testHealthWorker() {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  return {
    name: `Test Health Worker ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}
