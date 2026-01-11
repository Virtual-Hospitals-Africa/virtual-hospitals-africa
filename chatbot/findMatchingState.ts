import { assert } from 'std/assert/assert.ts'
import {
  ChatbotUserState,
  ConversationStateHandlerExpectMedia,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionRow,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  MatchingState,
  Maybe,
  TrxOrDb,
} from '../types.ts'
import * as defs from './defs.ts'
import { isValidDate } from '../util/date.ts'
import isValidLocationString from '../util/isValidLocationString.ts'

function findMatchingOption<US extends ChatbotUserState>(
  state:
    | ConversationStateHandlerSelect<US>
    | ConversationStateHandlerExpectMedia<US>,
  message_body: string,
): Maybe<ConversationStateHandlerSelectOption<US>> {
  return state.options.find((
    option: ConversationStateHandlerSelectOption<US>,
  ) => option.id === message_body)
}

function findMatchingRow<US extends ChatbotUserState>(
  action: ConversationStateHandlerListAction<US>,
  message_body: string,
): Maybe<ConversationStateHandlerListActionRow<US>> {
  for (const section of action.sections) {
    for (const row of section.rows) {
      if (row.id === message_body) return row
    }
  }
}

export default async function findMatchingState<US extends ChatbotUserState>(
  trx: TrxOrDb,
  userState: ChatbotUserState,
): Promise<Maybe<MatchingState<US>>> {
  // deno-lint-ignore no-explicit-any
  const conversation_states: any = defs[userState.chatbot_user.chatbot_name].conversation_states
  const current_state = conversation_states[userState.chatbot_user.conversation_state]

  if (!current_state) return null

  const message_body = userState.unhandled_message.body?.trim()

  switch (current_state.type) {
    case 'select': {
      assert(message_body)
      return findMatchingOption(current_state, message_body)
    }
    case 'action': {
      assert(message_body)
      const action = await current_state.action(trx, userState)
      return action.type === 'list' ? findMatchingRow(action, message_body) : findMatchingOption(action, message_body)
    }
    case 'date': {
      assert(message_body)
      return isValidDate(message_body) ? current_state : null
    }
    case 'string': {
      assert(message_body)
      const validation = current_state.validation || (() => true)
      const has_body_passing_validation = !!message_body &&
        validation(message_body)
      return has_body_passing_validation ? current_state : null
    }
    case 'expect_media': {
      if (userState.unhandled_message.has_media) return current_state
      assert(message_body)
      return findMatchingOption(current_state, message_body)
    }
    case 'get_location': {
      return isValidLocationString(message_body) ? current_state : null
    }
    default:
      return current_state
  }
}
