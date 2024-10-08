import { spy } from 'std/testing/mock.ts'
import generateUUID from '../../util/uuid.ts'
import { WhatsApp, WhatsAppJSONResponseSuccess } from '../../types.ts'

export function mockWhatsApp() {
  return {
    phone_number: '263XXXXXX',
    sendMessage: () => {
      throw new Error('sendMessage should not be called')
    },
    sendMessages: spy((_) =>
      Promise.resolve([
        {
          messaging_product: 'whatsapp' as const,
          contacts: [{ input: 'whatever', wa_id: `wamid.${generateUUID()}` }],
          messages: [{
            id: `wamid.${generateUUID()}`,
          }],
        } satisfies WhatsAppJSONResponseSuccess,
      ])
    ),
  } satisfies WhatsApp
}
