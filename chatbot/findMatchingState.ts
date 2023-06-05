import conversationStates from './conversationStates.ts'
import {
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionRow,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  MatchingState,
  Maybe,
  PatientState,
} from '../types.ts'
import { isValidDate } from "../util/date.ts";

function findMatchingOption(
  state: ConversationStateHandlerSelect,
  messageBody: string,
): Maybe<ConversationStateHandlerSelectOption> {
  return state.options.find((option: ConversationStateHandlerSelectOption) =>
    option.option === messageBody
  )
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

export default function findMatchingState(
  patientState: PatientState,
): Maybe<MatchingState> {
  const currentState = conversationStates[patientState.conversation_state]

  const messageBody = patientState.body.trim()

  switch (currentState.type) {
    case 'select': return findMatchingOption(currentState, messageBody)
    case 'list': return findMatchingRow(currentState.action(patientState), messageBody)
    case 'date': {
      return isValidDate(messageBody) ? currentState : null
    }
    case 'string': {
      const hasBodyPassingValidation = !!messageBody && (!currentState.validation || currentState.validation(messageBody))
      return hasBodyPassingValidation ? currentState : null
    }
    default: return currentState
  }
}
