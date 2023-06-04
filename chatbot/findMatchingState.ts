import conversationStates from './conversationStates.ts'
import words from '../util/words.ts'
import {
  ConversationStateHandler,
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionRow,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  DetermineNextConversationStateReturn,
  Maybe,
  PatientState,
} from '../types.ts'

function findMatchingOption(
  state: ConversationStateHandlerSelect,
  messageBody: string,
): Maybe<ConversationStateHandlerSelectOption> {
  const messageWords = words(messageBody.trim().toLowerCase())
  return state.options.find((option: ConversationStateHandlerSelectOption) => {
    if (option.option.toLowerCase() === messageBody) {
      return option
    }
    if (option.aliases) {
      if (
        option.aliases.some((alias) =>
          messageWords.some((word: string) => alias === word)
        )
      ) {
        return option
      }
    }
    const asNumber = parseInt(messageBody, 10)
    if (asNumber) {
      const asIndex = asNumber - 1
      if (asIndex >= 0 && asIndex < state.options.length) {
        return state.options[asIndex]
      }
    }
  })
}

function findMatchingRow(
  action: ConversationStateHandlerListAction,
  messageBody: string,
): Maybe<ConversationStateHandlerListActionRow> {
  for (const section of action.sections) {
    for (const row of section.rows) {
      if (row.id === messageBody) return row
    }
  }
}

function isValidResponse(
  state: ConversationStateHandler,
  messageBody: string,
): boolean {
  switch (state.type) {
    case 'initial_message':
      return true
    case 'select': {
      return !!findMatchingOption(state, messageBody)
    }
    case 'list':
      return true
    case 'date': {
      const [day, month, year] = messageBody.split('/')
      // deno-lint-ignore no-unused-vars
      const date = new Date(
        `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`,
      )
      // TODO
      // return isValid(date);
      return true
    }
    case 'string': {
      return (
        !!messageBody && (!state.validation || state.validation(messageBody))
      )
    }
    default: {
      return false
    }
  }
}

export default function findMatchingState(
  patientState: PatientState,
): DetermineNextConversationStateReturn {
  const currentState = conversationStates[patientState.conversation_state]

  const messageBody = patientState.body.trim()
  if (!isValidResponse(currentState, messageBody)) {
    return 'invalid_response'
  }
  if (currentState.type === 'select') {
    return findMatchingOption(currentState, messageBody)!
  }
  if (currentState.type === 'list') {
    return findMatchingRow(currentState.action(patientState), messageBody)!
  }
  return currentState
}
