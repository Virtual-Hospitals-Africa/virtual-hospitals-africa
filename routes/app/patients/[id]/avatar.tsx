import { assert } from 'https://deno.land/std@0.188.0/testing/asserts.ts'
import * as patients from '../../../../db/models/patients.ts'
import * as media from '../../../../db/models/media.ts'
import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import { file } from '../../../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )

    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid patient ID')

    const [patient] = await patients.getWithMedicalRecords(ctx.state.trx, {
      ids: [id],
      health_worker_id: healthWorker.id,
    })

    assert(patient, 'Patient not found')

    assert(patient.avatar_media_id, 'Patient has no avatar')

    const avatar = await media.get(ctx.state.trx, {
      media_id: patient.avatar_media_id,
    })

    const avatarData = avatar.binary_data
    return file(avatarData, avatar.mime_type)
  },
}
