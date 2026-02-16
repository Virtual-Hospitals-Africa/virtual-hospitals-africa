import { TrxOrDbOrQueryCreator } from './../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'
import { assertArrayIncludes } from 'std/assert/assert_array_includes.ts'
import { base } from './_base.ts'

function insertSpeech(
  trx: TrxOrDbOrQueryCreator,
  { media_speech_id, binary_data, mime_type, language_code }: {
    media_speech_id?: string
    binary_data: Uint8Array
    mime_type: string
    language_code: string
  },
) {
  assertArrayIncludes(['audio/webm', 'audio/wav'], [mime_type])
  const id = media_speech_id || generateUUID()
  return trx.with('inserting_media', (qb) =>
    qb.insertInto('media')
      .values({ id, binary_data, mime_type })).with(
      'inserting_audio',
      (qb) =>
        qb.insertInto('media_audios')
          .values({ id }),
    )
    .with(
      'inserting_speech',
      (qb) =>
        qb.insertInto('media_speeches')
          .values({ id, language_code }),
    )
    .selectNoFrom(success_true)
    .executeTakeFirstOrThrow()
}

function insertSpeechTranscription(
  trx: TrxOrDbOrQueryCreator,
  { media_speech_id, transcription, model }: {
    media_speech_id: string
    transcription: string
    model: string
  },
) {
  return trx.insertInto('speech_transcriptions')
    .values({
      media_speech_id,
      transcription,
      model,
      finished: true,
    })
    .executeTakeFirstOrThrow()
}

function insert(
  trx: TrxOrDbOrQueryCreator,
  opts: { binary_data: Uint8Array; mime_type: string },
): Promise<{
  id: string
  mime_type: string
}> {
  return trx.insertInto('media')
    .values(opts)
    .returning([
      'id',
      'mime_type',
    ])
    .executeTakeFirstOrThrow()
}

function baseQuery(trx: TrxOrDbOrQueryCreator, opts: { media_id?: string; appointment_id?: string }) {
  return trx.selectFrom('media')
    .select([
      'media.id',
      'media.mime_type',
      'media.binary_data',
      'media.created_at',
      'media.updated_at',
    ])
    .$if(!!opts.media_id, (qb) => qb.where('media.id', '=', opts.media_id!))
    .$if(!!opts.appointment_id, (qb) =>
      qb.innerJoin('appointment_media', 'appointment_media.media_id', 'media.id')
        .where('appointment_media.appointment_id', '=', opts.appointment_id!))
}

export const media = base({
  top_level_table: 'media' as const,
  baseQuery,
  formatResult: (x) => x,
  insertSpeech,
  insertSpeechTranscription,
  insert,
})
