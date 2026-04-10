import { dr as crud, m as assert, ds as getInitialTokensFromAuthCode, dt as GoogleClient, $ as assertOrRedirect, a0 as warning, d as db, a2 as promiseProps, h as health_workers, cJ as asNames, ag as events, du as sessions, r as redirect, dv as setCookie, dw as session_key, cV as google_tokens } from "../server-entry.mjs";
import { m as media } from "./media-DY7RW76U.mjs";
const health_worker_accounts = crud("health_worker_accounts");
async function downloadAndSaveAvatar(trx, picture_url) {
  try {
    const response = await fetch(picture_url);
    if (!response.ok) return null;
    const content_type = response.headers.get("content-type");
    if (!content_type?.startsWith("image/")) return null;
    const array_buffer = await response.arrayBuffer();
    const binary_data = new Uint8Array(array_buffer);
    const inserted_media = await media.insert(trx, {
      binary_data,
      mime_type: content_type
    });
    return inserted_media.id;
  } catch {
    return null;
  }
}
async function initializeHealthWorkerWithoutInvites(trx, google_client, profile) {
  const {
    avatar_media_id,
    existing_health_worker
  } = await promiseProps({
    avatar_media_id: downloadAndSaveAvatar(trx, profile.picture),
    existing_health_worker: health_workers.getIdByEmail(trx, profile.email)
  });
  const health_worker_attributes = asNames({
    first_names: profile.first_names,
    surname: profile.surname,
    name: profile.name
  });
  const health_worker_account_attributes = {
    email: profile.email,
    avatar_media_id
  };
  async function insertNewHealthWorker() {
    const health_worker_id2 = await health_workers.insertOne(trx, health_worker_attributes);
    await Promise.all([health_worker_accounts.insertOne(trx, {
      id: health_worker_id2,
      ...health_worker_account_attributes
    }), google_tokens.insertOne(trx, {
      entity_type: "health_worker",
      entity_id: health_worker_id2,
      // Don't ...spread - expires_in is not a column of google_tokens
      expires_at: google_client.tokens.expires_at,
      access_token: google_client.tokens.access_token,
      refresh_token: google_client.tokens.refresh_token
    })]);
    return {
      health_worker_id: health_worker_id2,
      existing_employment: null
    };
  }
  function updateExistingHealthWorker(health_worker_id2) {
    return promiseProps({
      health_worker_id: Promise.resolve(health_worker_id2),
      existing_employment: trx.selectFrom("employment").where("employment.health_worker_id", "=", health_worker_id2).select("employment.id").executeTakeFirst(),
      update_tokens: google_tokens.upsert(trx, "health_worker", health_worker_id2, google_client.tokens),
      health_worker: health_workers.updateById(trx, health_worker_id2, health_worker_attributes)
    });
  }
  const {
    health_worker_id,
    existing_employment
  } = await (existing_health_worker ? updateExistingHealthWorker(existing_health_worker.id) : insertNewHealthWorker());
  await events.insert(trx, {
    type: "HealthWorkerLogin",
    data: {
      health_worker_id
    }
  });
  const session_id = await sessions.insertOne(trx, {
    entity_type: "health_worker",
    entity_id: health_worker_id
  });
  const response = redirect(existing_employment ? "/app" : "/onboarding/welcome");
  setCookie(response.headers, {
    name: session_key,
    value: session_id
  });
  setCookie(response.headers, {
    name: "health_worker_id",
    value: health_worker_id
  });
  return response;
}
async function checkPermissions(google_client) {
  const token_info = await google_client.getTokenInfo();
  return token_info.scope.includes("calendar");
}
const insufficient_permissions = warning("You need to grant permission to access your Google Calendar to use this app.");
const handler = {
  async GET(ctx) {
    const code = ctx.url.searchParams.get("code");
    assert(code, "No code found in query params");
    const tokens = await getInitialTokensFromAuthCode(code);
    const google_client = new GoogleClient(tokens);
    const has_permissions = await checkPermissions(google_client);
    assertOrRedirect(has_permissions, insufficient_permissions);
    const profile = await google_client.getProfile();
    return db.transaction().setIsolationLevel("read committed").execute((trx) => initializeHealthWorkerWithoutInvites(trx, google_client, profile));
  }
};
export {
  handler as h
};
