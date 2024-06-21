import { assert } from 'std/assert/assert.ts'
import {
  ConversationStateHandlerExpectMedia,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionRow,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  MatchingState,
  Maybe,
  ChatbotUserState,
} from '../types.ts'
import * as defs from './defs.ts'
import { isValidDate } from '../util/date.ts'
import isValidLocationString from '../util/isValidLocationString.ts'

function findMatchingOption<US extends ChatbotUserState>(
  state:
    | ConversationStateHandlerSelect<US>
    | ConversationStateHandlerExpectMedia<US>,
  messageBody: string,
): Maybe<ConversationStateHandlerSelectOption<US>> {
  return state.options.find((
    option: ConversationStateHandlerSelectOption<US>,
  ) => option.id === messageBody)
}

function findMatchingRow<US extends ChatbotUserState>(
  action: ConversationStateHandlerListAction<US>,
  messageBody: string,
): Maybe<ConversationStateHandlerListActionRow<US>> {
  for (const section of action.sections) {
    for (const row of section.rows) {
      if (row.id === messageBody) return row
    }
  }
}

export default function findMatchingState<US extends ChatbotUserState>(
  userState: ChatbotUserState,
): Maybe<MatchingState<US>> {
  const { conversation_states } = defs[userState.chatbot_name]
  const currentState = conversation_states[userState.conversation_state]
  console.log('findMatchingState', userState, conversation_states, currentState)

  if (!currentState) return null

  const messageBody = userState.unhandled_message.body?.trim()

  switch (currentState.type) {
    case 'select': {
      assert(messageBody)
      return findMatchingOption(currentState, messageBody)
    }
    case 'action': {
      assert(messageBody)
      const action = currentState.action(userState)
      return action.type === 'list'
        ? findMatchingRow(action, messageBody)
        : findMatchingOption(action, messageBody)
    }
    case 'date': {
      assert(messageBody)
      return isValidDate(messageBody) ? currentState : null
    }
    case 'string': {
      assert(messageBody)
      const validation = currentState.validation || (() => true)
      const hasBodyPassingValidation = !!messageBody && validation(messageBody)
      return hasBodyPassingValidation ? currentState : null
    }
    case 'expect_media': {
      if (userState.unhandled_message.has_media) return currentState
      assert(messageBody)
      return findMatchingOption(currentState, messageBody)
    }
    case 'get_location': {
      return isValidLocationString(messageBody) ? currentState : null
    }
    default:
      return currentState
  }
}
