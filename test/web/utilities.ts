import { readLines } from 'https://deno.land/std@0.164.0/io/buffer.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.164.0/streams/conversion.ts'
import { NurseRegistrationDetails } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

export async function startWebServer(port: string): Promise<Deno.ChildProcess> {
  const process = new Deno.Command('deno', {
    args: [
      'task',
      'start',
    ],
    env: {
      PORT: port,
    },
    stdin: 'null',
    stdout: 'piped',
    stderr: 'null',
  }).spawn()

  const stdout = process.stdout.getReader()
  const lineReader = readLines(readerFromStreamReader(stdout))
  const ___timeout___ = Date.now()

  let line: string
  do {
    if (Date.now() > ___timeout___ + 20000) {
      stdout.releaseLock()
      await process.stdout.cancel()
      throw new Error('hung process')
    }
    line = (await lineReader.next()).value
  } while (line !== `Listening on https://localhost:${port}/`)
  stdout.releaseLock()

  return process
}

export async function killWebServer(process: Deno.ChildProcess) {
  await process.stdout.cancel()
  process.kill()
  await new Deno.Command('bash', {
    args: ['-c', `wait ${process.pid}`],
  }).output()
}

export const testHealthWorker = () => {
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + 1)
  return {
    name: 'Test Health Worker',
    email: generateUUID() + '@example.com',
    avatar_url: generateUUID() + '.com',
    gcal_appointments_calendar_id: generateUUID() +
      '@appointments.calendar.google.com',
    gcal_availability_calendar_id: generateUUID() +
      '@availability.calendar.google.com',
    access_token: 'access.' + generateUUID(),
    refresh_token: 'refresh.' + generateUUID(),
    expires_in: 3599,
    expires_at,
  }
}

export const testRegistrationDetails = (
  { health_worker_id }: { health_worker_id: number },
): NurseRegistrationDetails => ({
  health_worker_id,
  gender: 'male',
  national_id: '12345678A12',
  date_of_first_practice: '1999-11-11',
  ncz_registration_number: 'GN123456',
  mobile_number: '1111',
  national_id_media_id: undefined,
  ncz_registration_card_media_id: undefined,
  face_picture_media_id: undefined,
  approved_by: undefined,
  address: 'test address',
})
