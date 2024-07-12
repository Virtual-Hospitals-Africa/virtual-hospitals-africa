import { InsertResult, sql, UpdateResult } from 'kysely'
import {
  ChatbotName,
  HasStringId,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppMessageContents,
  WhatsAppMessageReceived,
} from '../../types.ts'

export function updateReadStatus(
  trx: TrxOrDb,
  opts: { whatsapp_id: string; read_status: string },
): Promise<UpdateResult[]> {
  return trx
    .updateTable('whatsapp_messages_sent')
    .set({ read_status: opts.read_status })
    .where('whatsapp_id', '=', opts.whatsapp_id)
    .execute()
}

export function isWhatsAppContents(
  contents: unknown,
): contents is WhatsAppMessageContents {
  if (!contents || typeof contents !== 'object') {
    return false
  }
  if (
    !('has_media' in contents) || !('media_id' in contents) ||
    !('body' in contents)
  ) {
    return false
  }
  if (contents.has_media) {
    return !!contents.media_id && typeof contents.media_id === 'string' &&
      !contents.body
  }
  return contents.media_id === null && !!contents.body &&
    typeof contents.body === 'string'
}

export function insertMessageReceived(
  trx: TrxOrDb,
  data:
    & {
      received_by_phone_number: string
      sent_by_phone_number: string
      chatbot_name: ChatbotName
    }
    & Pick<
      WhatsAppMessageReceived,
      'whatsapp_id' | 'has_media' | 'body' | 'media_id'
    >,
): Promise<
  HasStringId<Omit<WhatsAppMessageReceived, 'started_responding_at'>>
> {
  return trx
    .insertInto('whatsapp_messages_received')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function insertMessageSent(
  trx: TrxOrDb,
  opts: {
    sent_by_phone_number: string
    sent_to_phone_number: string
    chatbot_name: ChatbotName
    responding_to_received_id: string
    whatsapp_id: string
    body: string
  },
): Promise<InsertResult> {
  return trx
    .insertInto('whatsapp_messages_sent')
    .values({ ...opts, read_status: 'sent' })
    .executeTakeFirstOrThrow()
}

export async function getUnhandledMessages(
  trx: TrxOrDb,
  { chatbot_name, commitHash, sent_by_phone_number }: {
    chatbot_name: ChatbotName
    commitHash: string
    sent_by_phone_number?: string
  },
): Promise<UnhandledMessage[]> {
  let query = trx
    .updateTable('whatsapp_messages_received')
    .where('chatbot_name', '=', chatbot_name)
    .where((eb) =>
      eb.or([
        eb('whatsapp_messages_received.started_responding_at', 'is', null),
        eb.and([
          eb('whatsapp_messages_received.error_commit_hash', 'is not', null),
          eb('whatsapp_messages_received.error_commit_hash', '!=', commitHash),
        ]),
      ])
    )
    .set('started_responding_at', sql`now()`)
    .returning([
      'whatsapp_messages_received.chatbot_name',
      'whatsapp_messages_received.id as message_received_id',
      'whatsapp_messages_received.whatsapp_id',
      'whatsapp_messages_received.body',
      'whatsapp_messages_received.has_media',
      'whatsapp_messages_received.media_id',
      'whatsapp_messages_received.sent_by_phone_number',
    ])

  if (sent_by_phone_number) {
    query = query.where('sent_by_phone_number', '=', sent_by_phone_number)
  }

  const results = await query.execute()
  return results.map((result) => ({
    ...result,
    trimmed_body: result.body?.trim() ?? null,
  }))
}

export function markChatbotError(
  trx: TrxOrDb,
  opts: {
    chatbot_name: ChatbotName
    whatsapp_message_received_id: string
    commitHash: string
    errorMessage: string
  },
) {
  return trx
    .updateTable('whatsapp_messages_received')
    .set({
      error_commit_hash: opts.commitHash,
      error_message: opts.errorMessage,
    })
    .where('id', '=', opts.whatsapp_message_received_id)
    .executeTakeFirstOrThrow()
}

export function getUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  opts: {
    chatbot_user_id: string
    phone_number?: undefined
  } | {
    phone_number: string
    chatbot_user_id?: undefined
  },
) {
  let query = trx.selectFrom(`${chatbot_name}_chatbot_users`).selectAll()

  if (opts.chatbot_user_id) {
    query = query.where('id', '=', opts.chatbot_user_id)
  }
  if (opts.phone_number) {
    query = query.where('phone_number', '=', opts.phone_number)
  }

  return query.executeTakeFirst()
}

export function updateChatbotUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  chatbot_user_id: string,
  { data, ...updates }: {
    entity_id?: string | null
    conversation_state?: string
    data?: Record<string, unknown>
  },
) {
  if (data) {
    Object.assign(updates, { data: JSON.stringify(data) })
  }

  console.log('updates', updates)

  return trx.updateTable(`${chatbot_name}_chatbot_users`)
    .set(updates)
    .where('id', '=', chatbot_user_id)
    .executeTakeFirstOrThrow()
}

export function insertChatbotUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  phone_number: string,
) {
  return trx
    .insertInto(`${chatbot_name}_chatbot_users`)
    .values({
      phone_number,
      conversation_state: 'initial_message',
      data: '{}',
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function findChatbotUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  phone_number: string,
) {
  return trx
    .selectFrom(`${chatbot_name}_chatbot_users`)
    .selectAll()
    .where('phone_number', '=', phone_number)
    .executeTakeFirst()
}
