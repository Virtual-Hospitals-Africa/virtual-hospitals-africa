import {
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

  const prompt = typeof state.prompt === 'string'
    ? state.prompt
    : state.prompt(userState)

  switch (state.type) {
    case 'select': {
      return {
        type: 'buttons',
        messageBody: prompt,
        buttonText: 'Menu',
        options: state.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs
      }
    }
    case 'action': {
      const action = state.action(userState)
      return action.type === 'list'
        ? {
          type: 'list',
          messageBody: prompt,
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
          type: 'buttons',
          messageBody: prompt,
          buttonText: 'Menu',
          options: action.options.map(pick(['id', 'title'])), // Select only the fields whatsapp needs,
        }
    }
    case 'location': {
      return {
        type: 'location',
        messageBody: prompt,
        location: JSON.parse(prompt),
      }
    }
    case 'date': {
      return stringSendable(
        prompt + ' Please enter the date in the format DD/MM/YYYY',
      ) // https://en.wikipedia.org/wiki/Date_format_by_country
    }
    case 'string': {
      return stringSendable(prompt)
    }
    case 'end_of_demo': {
      return stringSendable(prompt)
    }
    default: {
      return stringSendable('What happened!?!?!?!?!?')
    }
  }
}
