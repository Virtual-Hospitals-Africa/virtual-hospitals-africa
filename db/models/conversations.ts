import { InsertResult, sql, UpdateResult } from 'kysely'
import {
  ChatbotName,
  ChatbotUser,
  HasStringId,
  TrxOrDb,
  UnhandledMessage,
  WhatsAppMessageContents,
  WhatsAppMessageReceived,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { literalString, now } from '../helpers.ts'

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
          eb(
            'whatsapp_messages_received.started_responding_at',
            'is not',
            null,
          ),
          eb('whatsapp_messages_received.error_message', 'is', null),
          eb('whatsapp_messages_received.error_commit_hash', 'is not', null),
          eb('whatsapp_messages_received.error_commit_hash', '!=', commitHash),
        ]),
      ])
    )
    .set('started_responding_at', now)
    .returning([
      'whatsapp_messages_received.chatbot_name',
      'whatsapp_messages_received.id as message_received_id',
      'whatsapp_messages_received.whatsapp_id',
      'whatsapp_messages_received.body',
      'whatsapp_messages_received.has_media',
      'whatsapp_messages_received.media_id',
      'whatsapp_messages_received.sent_by_phone_number',
      'whatsapp_messages_received.created_at',
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

export async function updateChatbotUser(
  trx: TrxOrDb,
  chatbot_user: ChatbotUser,
  updates: {
    conversation_state?: string
    entity_id?: string | null
    data?: Record<string, unknown>
  },
) {
  await trx.updateTable(`${chatbot_user.chatbot_name}_chatbot_users`)
    // deno-lint-ignore no-explicit-any
    .set(updates as any)
    .where('id', '=', chatbot_user.id)
    .executeTakeFirstOrThrow()

  return Object.assign(chatbot_user, updates)
}

export async function insertChatbotUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  phone_number: string,
): Promise<ChatbotUser> {
  const { data, ...user } = await trx
    .insertInto(`${chatbot_name}_chatbot_users`)
    .values({
      phone_number,
      conversation_state: 'initial_message',
      data: '{}',
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  assert(isObjectLike(data))
  return {
    ...user,
    data,
    chatbot_name,
  } as ChatbotUser
}

export async function findChatbotUser(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  phone_number: string,
): Promise<ChatbotUser | undefined> {
  const user = await trx
    .selectFrom(`${chatbot_name}_chatbot_users`)
    .selectAll()
    .select(literalString(chatbot_name).as('chatbot_name'))
    .where('phone_number', '=', phone_number)
    .executeTakeFirst()

  if (!user) return
  assert(isObjectLike(user.data))
  return user as ChatbotUser
}

export function getLastConversationState(
  trx: TrxOrDb,
  chatbot_name: ChatbotName,
  where: { phone_number?: string; entity_id?: string },
) {
  assert(where.phone_number || where.entity_id)
  return trx
    .selectFrom(`${chatbot_name}_chatbot_users`)
    .select('conversation_state')
    .select(literalString(chatbot_name).as('chatbot_name'))
    .$if(
      !!where.phone_number,
      (eb) => eb.where('phone_number', '=', where.phone_number!),
    )
    .$if(
      !!where.entity_id,
      (eb) => eb.where('entity_id', '=', where.entity_id!),
    )
    .executeTakeFirstOrThrow()
}
