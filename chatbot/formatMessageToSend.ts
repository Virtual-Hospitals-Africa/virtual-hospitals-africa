import {
  Clinic,
  ConversationStates,
  UserState,
  WhatsAppSendable,
  WhatsAppSendableString,
} from '../types.ts'
import pick from '../util/pick.ts'

function stringSendable(messageBody: string): WhatsAppSendableString {
  return {
    type: 'string',
    messageBody,
  }
}

export default function formatMessageToSend<
  CS extends string,
  US extends UserState<CS>,
>(
  conversationStates: ConversationStates<US['conversation_state'], US>,
  userState: US,
): WhatsAppSendable {
  const state = conversationStates[
    userState.conversation_state
  ]

  const messageBody = typeof state.prompt === 'string'
    ? state.prompt
    : state.prompt(userState)

  switch (state.type) {
    case 'select': {
      return {
        messageBody,
        type: 'buttons',
        buttonText: 'Menu',
        options: state.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs
      }
    }
    case 'action': {
      const action = state.action(userState)
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
    case 'location': {
      const clinic: Clinic = JSON.parse(messageBody).chosenClinic
      return {
        type: 'location',
        messageBody: messageBody,
        clinic: clinic,
      }
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
    default: {
      return stringSendable('What happened!?!?!?!?!?')
    }
  }
}
