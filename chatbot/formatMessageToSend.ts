import { ChatbotUserState, ConversationStateHandler, TrxOrDb, WhatsAppSendable, WhatsAppSendableString, WhatsAppSingleSendable } from '../types.ts'
import pick from '../util/pick.ts'

function stringSendable(message_body: string): WhatsAppSendableString {
  return {
    type: 'string',
    message_body,
  }
}

export default async function formatMessageToSend<
  US extends ChatbotUserState,
>(
  trx: TrxOrDb,
  userState: US,
  state: ConversationStateHandler<US>,
): Promise<WhatsAppSingleSendable | WhatsAppSendable> {
  console.log('state', state)

  const message_body = typeof state.prompt === 'string' ? state.prompt : await state.prompt(trx, userState)

  switch (state.type) {
    case 'select':
    case 'expect_media': {
      return {
        message_body,
        type: 'buttons',
        buttonText: 'Menu',
        options: state.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs
      }
    }
    case 'action': {
      const action = await state.action(trx, userState)
      return action.type === 'list'
        ? {
          message_body,
          type: 'list',
          headerText: state.headerText,
          // Select only the fields whatsapp needs
          action: {
            button: action.button,
            sections: action.sections.map((section) => ({
              title: section.title,
              rows: section.rows.map(pick(['id', 'title', 'description'])),
            })),
          },
        }
        : {
          message_body,
          type: 'buttons',
          buttonText: 'Menu',
          options: action.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs,
        }
    }
    case 'send_location':
    case 'send_document': {
      return state.getMessages(trx, userState)
    }
    case 'date': {
      return stringSendable(
        message_body + ' Please enter the date in the format DD/MM/YYYY',
      ) // https://en.wikipedia.org/wiki/Date_format_by_country
    }
    case 'string': {
      return stringSendable(message_body)
    }
    case 'get_location': {
      return stringSendable(message_body)
    }
    default: {
      return stringSendable('What happened!?!?!?!?!?')
    }
  }
}
