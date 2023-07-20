import { assert } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import {
  ConversationStateHandlerExpectMedia,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionRow,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  ConversationStates,
  MatchingState,
  Maybe,
  UserState,
} from '../types.ts'
import { isValidDate } from '../util/date.ts'

// deno-lint-ignore no-explicit-any
function findMatchingOption<US extends UserState<any>>(
  state:
    | ConversationStateHandlerSelect<US>
    | ConversationStateHandlerExpectMedia<US>,
  messageBody: string,
): Maybe<ConversationStateHandlerSelectOption<US>> {
  return state.options.find((
    option: ConversationStateHandlerSelectOption<US>,
  ) => option.id === messageBody)
}

// deno-lint-ignore no-explicit-any
function findMatchingRow<US extends UserState<any>>(
  action: ConversationStateHandlerListAction<US>,
  messageBody: string,
): Maybe<ConversationStateHandlerListActionRow<US>> {
  for (const section of action.sections) {
    for (const row of section.rows) {
      if (row.id === messageBody) return row
    }
  }
}

export default function findMatchingState<
  CS extends string,
  US extends UserState<CS>,
>(
  conversationStates: ConversationStates<US['conversation_state'], US>,
  userState: US,
): Maybe<MatchingState<US>> {
  const currentState = conversationStates[userState.conversation_state]

  const messageBody = userState.body?.trim()

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
      if (userState.has_media) return currentState
      assert(messageBody)
      return findMatchingOption(currentState, messageBody)
    }
    case 'get_location': {
      // TODO
      if (messageBody?.includes("longitude")) {
        return currentState
      } else {
        return null
      }
    }
    default:
      return currentState
  }
}
