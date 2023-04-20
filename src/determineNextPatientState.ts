import conversationStates from "./conversationStates.ts";
// import { isValid } from "date-fns";
import words from "./util/words.ts";
import {
  Appointment,
  ConversationStateHandler,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  DetermineNextPatientStateReturn,
  DetermineNextPatientStateValidReturn,
  Maybe,
  MessageOptions,
  Patient,
  UnhandledPatientMessage,
} from "./types.ts";

function findMatchingOption(
  state: ConversationStateHandlerSelect,
  messageBody: string,
): Maybe<ConversationStateHandlerSelectOption> {
  const messageWords = words(messageBody.trim().toLowerCase());
  return state.options.find((option: ConversationStateHandlerSelectOption) => {
    if (option.option.toLowerCase() === messageBody) {
      return option;
    }
    if (option.aliases) {
      if (
        option.aliases.some((alias) =>
          messageWords.some((word: string) => alias === word)
        )
      ) {
        return option;
      }
    }
    const asNumber = parseInt(messageBody, 10);
    if (asNumber) {
      const asIndex = asNumber - 1;
      if (asIndex >= 0 && asIndex < state.options.length) {
        return state.options[asIndex];
      }
    }
  });
}

function isValidResponse(
  state: ConversationStateHandler,
  messageBody: string,
): boolean {
  switch (state.type) {
    case "select": {
      return !!findMatchingOption(state, messageBody);
    }
    case "date": {
      const [day, month, year] = messageBody.split("/");
      const date = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`,
      );
      // TODO
      // return isValid(date);
      return true;
    }
    case "string": {
      return !!messageBody &&
        (!state.validation || state.validation(messageBody));
    }
    default: {
      return false;
    }
  }
}

export function formatMessageToSend(
  state: ConversationStateHandler,
  patientMessage: UnhandledPatientMessage,
): string | {
  messageBody: string;
  buttonText: string;
  options: MessageOptions[];
} {
  const prompt = typeof state.prompt === "string"
    ? state.prompt
    : state.prompt(patientMessage);

  switch (state.type) {
    case "select": {
      return {
        messageBody: prompt,
        buttonText: "Menu",
        options: [{
          rows: state.options.map((option) => ({
            id: option.option,
            title: option.display,
          })),
        }],
      };
    }
    case "date": {
      return prompt + " Please enter the date in the format DD/MM/YYYY"; // https://en.wikipedia.org/wiki/Date_format_by_country
    }
    case "string": {
      return prompt;
    }
    case "end_of_demo": {
      return prompt;
    }
    default: {
      return "What happened!?!?!?!?!?";
    }
  }
}

const pickPatient = (patientMessage: UnhandledPatientMessage) => ({
  phone_number: patientMessage.phone_number,
  name: patientMessage.name,
  gender: patientMessage.gender,
  date_of_birth: patientMessage.date_of_birth,
  national_id_number: patientMessage.national_id_number,
});

export default function determineNextPatientState(
  patientMessage: UnhandledPatientMessage,
): DetermineNextPatientStateReturn {
  const messageBody = patientMessage.body.trim();

  if (!patientMessage.conversation_state) {
    return {
      nextPatient: {
        ...pickPatient(patientMessage),
        id: patientMessage.patient_id,
        conversation_state: "not_onboarded:welcome",
      },
    };
  }

  const currentState = conversationStates[patientMessage.conversation_state];

  if (currentState.type === "end_of_demo") {
    return {
      nextPatient: {
        ...pickPatient(patientMessage),
        id: patientMessage.patient_id,
        conversation_state: patientMessage.conversation_state,
      },
    };
  }

  if (!isValidResponse(currentState, messageBody)) {
    return "invalid_response";
  }

  const { onResponse } = currentState.type === "select"
    ? findMatchingOption(currentState, messageBody)!
    : currentState;

  const next = typeof onResponse === "string"
    ? { nextState: onResponse }
    : onResponse(patientMessage);

  const nextPatient: Patient & { id: number } = {
    ...pickPatient(patientMessage),
    id: patientMessage.patient_id,
    conversation_state: next.nextState,
    ...next.patientUpdates,
  };

  const nextAppointment: Maybe<Appointment & { id: number }> =
    next.appointmentUpdates && {
      id: patientMessage.scheduling_appointment_id!,
      patient_id: patientMessage.patient_id,
      reason: patientMessage.scheduling_appointment_reason!,
      ...next.appointmentUpdates,
    };

  const toReturn: DetermineNextPatientStateValidReturn = { nextPatient };
  if (nextAppointment) {
    toReturn.nextAppointment = nextAppointment;
  }

  return toReturn;
}
