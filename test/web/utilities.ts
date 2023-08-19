import { readLines } from 'https://deno.land/std@0.140.0/io/buffer.ts'
import { readerFromStreamReader } from 'https://deno.land/std@0.140.0/streams/conversion.ts'
import { NurseRegistrationDetails } from '../../types.ts'

export async function dbWipeThenLatest() {
  await new Deno.Command('deno', {
    args: [
      'task',
      'db:migrate:wipe',
    ],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).output()

  await new Deno.Command('deno', {
    args: [
      'task',
      'db:migrate:latest',
    ],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).output()
}

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

export async function cleanUpWebServer(process: Deno.ChildProcess) {
  await process.stdout.cancel()
  await dbWipeThenLatest()
  process.kill()
}

export const testHealthWorker = {
  name: 'Test Health Worker',
  email: 'test@healthworker.com',
  avatar_url:
    'https://lh3.googleusercontent.com/a/AAcHTtdCli8DiIjBkdb9TZL3W46MoxFPOy2Xuqkm345WiS446Ow=s96-c',
  gcal_appointments_calendar_id:
    'vjf3q6onfgnn83me7rf10fdcj4@group.calendar.google.com',
  gcal_availability_calendar_id:
    'fq5vbod94ihhherp9fad2tlaqk@group.calendar.google.com',
  access_token: 'ya29.whateverlrkwlkawlk-tl2O85WA2QW_1Lf_P4lRqyAG4aUCIo0D18F',
  expires_in: 3599,
  refresh_token:
    '1//01_ao4e0Kf-uTCgYIARAAGAESNwF-L9IrQkmis6YBAP4NE7BWrI7ry1qSeotPA_DLMYW9yiGLUUsaOjy7rlUvYs2nL_BTFjuv',
  expires_at: '2023-07-25T19:20:45.123Z',
}

export const testRegistrationDetails: NurseRegistrationDetails = {
  health_worker_id: 1,
  gender: 'male',
  national_id: '12345678A12',
  date_of_first_practice: new Date(1999, 11, 11),
  ncz_registration_number: 'GN123456',
  mobile_number: '1111',
  national_id_media_id: undefined,
  ncz_registration_card_media_id: undefined,
  face_picture_media_id: undefined,
  approved_by: undefined,
}
