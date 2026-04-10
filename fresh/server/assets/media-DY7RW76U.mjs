import { dx as equal, dy as format, dz as AssertionError, aU as base, ad as generateUUID, aQ as success_true } from "../server-entry.mjs";
function assertArrayIncludes(actual, expected, msg) {
  const missing = [];
  for (let i = 0; i < expected.length; i++) {
    let found = false;
    for (let j = 0; j < actual.length; j++) {
      if (equal(expected[i], actual[j])) {
        found = true;
        break;
      }
    }
    if (!found) {
      missing.push(expected[i]);
    }
  }
  if (missing.length === 0) {
    return;
  }
  const msgSuffix = msg ? `: ${msg}` : ".";
  msg = `Expected actual: "${format(actual)}" to include: "${format(expected)}"${msgSuffix}
missing: ${format(missing)}`;
  throw new AssertionError(msg);
}
function insertSpeech(trx, {
  media_speech_id,
  binary_data,
  mime_type,
  language_code
}) {
  assertArrayIncludes(["audio/webm", "audio/wav"], [mime_type]);
  const id = media_speech_id || generateUUID();
  return trx.with("inserting_media", (qb) => qb.insertInto("media").values({
    id,
    binary_data,
    mime_type
  })).with("inserting_audio", (qb) => qb.insertInto("media_audios").values({
    id
  })).with("inserting_speech", (qb) => qb.insertInto("media_speeches").values({
    id,
    language_code
  })).selectNoFrom(success_true).executeTakeFirstOrThrow();
}
function insertSpeechTranscription(trx, {
  media_speech_id,
  transcription,
  model
}) {
  return trx.insertInto("speech_transcriptions").values({
    media_speech_id,
    transcription,
    model,
    finished: true
  }).executeTakeFirstOrThrow();
}
function insert(trx, opts) {
  return trx.insertInto("media").values(opts).returning(["id", "mime_type"]).executeTakeFirstOrThrow();
}
function baseQuery(trx, opts) {
  return trx.selectFrom("media").select(["media.id", "media.mime_type", "media.binary_data", "media.created_at", "media.updated_at"]).$if(!!opts.media_id, (qb) => qb.where("media.id", "=", opts.media_id)).$if(!!opts.appointment_id, (qb) => qb.innerJoin("appointment_media", "appointment_media.media_id", "media.id").where("appointment_media.appointment_id", "=", opts.appointment_id));
}
const media = base({
  top_level_table: "media",
  baseQuery,
  formatResult: (x) => x,
  insertSpeech,
  insertSpeechTranscription,
  insert
});
export {
  media as m
};
