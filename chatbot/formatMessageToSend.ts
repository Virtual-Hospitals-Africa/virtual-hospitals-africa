import {
  ChatbotUserState,
  ConversationStateHandler,
  TrxOrDb,
  WhatsAppSendable,
  WhatsAppSendableString,
  WhatsAppSingleSendable,
} from '../types.ts'
import pick from '../util/pick.ts'

function stringSendable(messageBody: string): WhatsAppSendableString {
  return {
    type: 'string',
    messageBody,
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

  const messageBody = typeof state.prompt === 'string'
    ? state.prompt
    : await state.prompt(trx, userState)

  console.log('messageBody', messageBody)

  switch (state.type) {
    case 'select':
    case 'expect_media': {
      return {
        messageBody,
        type: 'buttons',
        buttonText: 'Menu',
        options: state.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs
      }
    }
    case 'action': {
      const action = await state.action(trx, userState)
      return action.type === 'list'
        ? {
          messageBody,
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
          messageBody,
          type: 'buttons',
          buttonText: 'Menu',
          options: action.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs,
        }
    }
    case 'send_location': {
      return state.getMessages(trx, userState)
    }
    case 'date': {
      return stringSendable(
        messageBody + ' Please enter the date in the format DD/MM/YYYY',
      ) // https://en.wikipedia.org/wiki/Date_format_by_country
    }
    case 'string': {
      return stringSendable(messageBody)
    }
    case 'end_of_demo': {
      return stringSendable(messageBody)
    }
    case 'get_location': {
      return stringSendable(messageBody)
    }
    default: {
      return stringSendable('What happened!?!?!?!?!?')
    }
  }
}
