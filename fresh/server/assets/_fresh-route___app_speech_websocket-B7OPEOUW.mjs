import { Q as compact, m as assert, v as assertOr400, ad as generateUUID } from "../server-entry.mjs";
import { m as media } from "./media-DY7RW76U.mjs";
import { u as upgradeWebsocket } from "./websocket-CnEsHi7E.mjs";
import { deferred } from "https://deno.land/std@0.136.0/async/deferred.ts";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
async function readAllChunks(reader) {
  const chunks = [];
  let total_length = 0;
  const stream_reader = reader.getReader();
  try {
    while (true) {
      const {
        done,
        value
      } = await stream_reader.read();
      if (done) break;
      chunks.push(value);
      total_length += value.length;
    }
  } finally {
    stream_reader.releaseLock();
  }
  return {
    chunks,
    total_length
  };
}
async function readAllToString(reader) {
  const {
    chunks,
    total_length
  } = await readAllChunks(reader);
  const finished = new Uint8Array(total_length);
  let offset = 0;
  for (const chunk of chunks) {
    finished.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(finished).trim();
}
async function* readLines(reader) {
  const stream_reader = reader.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const {
        done,
        value
      } = await stream_reader.read();
      if (done) break;
      const chunk = decoder.decode(value, {
        stream: true
      });
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) {
          yield line;
        }
      }
    }
  } finally {
    stream_reader.releaseLock();
  }
  if (buffer.trim()) {
    yield buffer;
  }
}
const WHISPER_MODELS_DIRECTORY_PATH = Deno.env.get("WHISPER_MODELS_DIRECTORY_PATH");
const available_transcription_models = WHISPER_MODELS_DIRECTORY_PATH ? compact(Deno.readDirSync(WHISPER_MODELS_DIRECTORY_PATH).map((value) => value.isDirectory && value.name.startsWith("whisper") && value.name).toArray()) : [];
const MODELS_TO_LANGUAGE_CODES = {
  "whisper-small-english-finetuned": "eng",
  "whisper-large-shona": "sna",
  "whisper-small-sesotho": "sot",
  "whisper-large-v2-spanish": "spa",
  "whisper-small-xhosa": "xho"
};
const LANGUAGE_CODES_TO_MODELS = Object.fromEntries(Object.entries(MODELS_TO_LANGUAGE_CODES).map(([model, language_code]) => [language_code, model]));
const supported_language_codes = compact(available_transcription_models.map((model) => MODELS_TO_LANGUAGE_CODES[model]));
function transcriptionProcess(language_code) {
  assert(WHISPER_MODELS_DIRECTORY_PATH, "Must set WHISPER_MODELS_DIRECTORY_PATH to transcribe audio");
  assert(available_transcription_models.length, `No models found in WHISPER_MODELS_DIRECTORY_PATH ${WHISPER_MODELS_DIRECTORY_PATH}`);
  assert(supported_language_codes.includes(language_code), `${language_code} is not yet supported`);
  const model = `${WHISPER_MODELS_DIRECTORY_PATH}/${LANGUAGE_CODES_TO_MODELS[language_code]}`;
  const process = new Deno.Command("python", {
    args: ["./external-clients/whisper/transcribe.py", model],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped"
  }).spawn();
  const writer = process.stdin.getWriter();
  const logStdErr = async () => {
    for await (const line of readLines(process.stderr)) {
      console.log(line);
    }
  };
  logStdErr();
  async function finish() {
    const transcription_status = await process.status;
    assert(transcription_status.success, `Transcription failed with exit code: ${transcription_status.code}`);
    return readAllToString(process.stdout);
  }
  return {
    model,
    async transcribe(file_path) {
      await writer.write(new TextEncoder().encode(file_path));
      await writer.close();
      return finish();
    }
  };
}
function convertToWavWriteToFile(file_path) {
  const process = new Deno.Command("ffmpeg", {
    args: ["-f", "webm", "-i", "pipe:0", "-f", "wav", "-ar", "16000", "-ac", "1", "-y", file_path],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped"
  }).spawn();
  const writer = process.stdin.getWriter();
  const finished = deferred();
  async function finish() {
    await writer.close();
    const status = await process.status;
    if (status.success) return finished.resolve();
    return finished.reject(readAllToString(process.stderr));
  }
  return {
    writer,
    finish,
    sigterm() {
      return process.kill("SIGTERM");
    }
  };
}
function createPipeline(language_code) {
  const media_speech_id = generateUUID();
  const start_time = /* @__PURE__ */ new Date();
  const transcription = transcriptionProcess(language_code);
  const file_path = `temp_files/${media_speech_id}.wav`;
  const ffmpeg_process = convertToWavWriteToFile(file_path);
  const audio_chunks = [];
  let total_bytes = 0;
  let is_stream_closed = false;
  const deferred_media = deferred();
  const deferred_transcription = deferred();
  async function onAudioChunk(audio_chunk) {
    audio_chunks.push(audio_chunk);
    total_bytes += audio_chunk.length;
    await ffmpeg_process.writer.write(audio_chunk);
    const duration = Date.now() - start_time.getTime();
    console.log(`🎵 Audio chunk streamed - media_speech_id: ${media_speech_id}, Size: ${audio_chunk.length} bytes, Total: ${total_bytes} bytes, Duration: ${Math.round(duration / 1e3)}s`);
  }
  async function onAudioEnded() {
    if (is_stream_closed) return;
    is_stream_closed = true;
    const now = Date.now();
    Promise.resolve().then(() => {
      const binary_data = new Uint8Array(total_bytes);
      let offset = 0;
      for (const chunk of audio_chunks) {
        binary_data.set(chunk, offset);
        offset += chunk.length;
      }
      deferred_media.resolve({
        binary_data,
        mime_type: "audio/webm"
      });
    });
    await ffmpeg_process.finish();
    console.log(`Ffmpeg finished after an additional ${Date.now() - now} milliseconds`);
    const transcribed_text = await transcription.transcribe(file_path);
    deferred_transcription.resolve(transcribed_text);
  }
  return {
    media_speech_id,
    deferred_media,
    deferred_transcription,
    transcription_model: transcription.model,
    async onMessage({
      data
    }) {
      if (is_stream_closed) return;
      if (typeof data === "string") {
        const parsed = JSON.parse(data);
        if (parsed.type === "audio_ended") {
          return onAudioEnded();
        }
        throw new Error(`📝 Unexpected Text message ${data}`);
      }
      if (data instanceof ArrayBuffer) {
        return onAudioChunk(new Uint8Array(data));
      }
      if (data instanceof Blob) {
        const array_buffer = await data.arrayBuffer();
        return onAudioChunk(new Uint8Array(array_buffer));
      }
      throw new Error("Unexpected data type: " + data);
    },
    async cleanup() {
      if (!is_stream_closed) {
        is_stream_closed = true;
        await ffmpeg_process.writer.close();
        ffmpeg_process.sigterm();
      }
    }
  };
}
const speechWebsocket = upgradeWebsocket((ctx, socket) => {
  const language_code = ctx.url.searchParams.get("language_code");
  assertOr400(language_code, "Needs language code");
  assertOr400(supported_language_codes.includes(language_code), `Transcription not supported for ${language_code}`);
  const pipeline = createPipeline(language_code);
  socket.onopen = () => socket.send(JSON.stringify({
    type: "connection_established",
    message: "Ready to receive audio stream",
    media_speech_id: pipeline.media_speech_id
  }));
  socket.onmessage = pipeline.onMessage;
  socket.onclose = pipeline.cleanup;
  socket.onerror = pipeline.cleanup;
  pipeline.deferred_media.then((media_data) => media.insertSpeech(ctx.state.trx, {
    media_speech_id: pipeline.media_speech_id,
    language_code,
    ...media_data
  }));
  pipeline.deferred_transcription.then(async (transcription) => {
    socket.send(JSON.stringify({
      type: "transcription_finished",
      media_speech_id: pipeline.media_speech_id,
      transcription
    }));
    await media.insertSpeechTranscription(ctx.state.trx, {
      transcription,
      media_speech_id: pipeline.media_speech_id,
      model: pipeline.transcription_model
    });
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_speech_websocket = speechWebsocket;
export {
  config,
  css,
  _freshRoute___app_speech_websocket as default,
  handler,
  handlers
};
