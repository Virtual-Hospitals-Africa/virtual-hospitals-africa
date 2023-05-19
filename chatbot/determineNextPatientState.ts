import conversationStates from "./conversationStates.ts";
import words from "../util/words.ts";
import {
  Appointment,
  ConversationStateHandler,
  ConversationStateHandlerSelect,
  ConversationStateHandlerSelectOption,
  ConversationStateHandlerList,
  DetermineNextPatientStateReturn,
  DetermineNextPatientStateValidReturn,
  Maybe,
  Patient,
  UnhandledPatientMessage,
  WhatsAppSendable,
  WhatsAppSendableString,
  ConversationStateHandlerListActionSection,
} from "../types.ts";
// have to create a new function for list
function findMatchingOption(
  state: ConversationStateHandlerSelect,
  messageBody: string
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

function findMatchingListOption(
  state: ConversationStateHandlerList,
  messageBody: string
): Maybe<ConversationStateHandlerListActionSection>{
  return state.action.sections.find((section: ConversationStateHandlerListActionSection) => {
    for (const{ id } of section.rows){
      console.log('WHat is section here?', section)
      console.log("here insdie find matching option", id)
      if (id === messageBody){
        console.log('section matched.', section, 'message body is:', messageBody)
        return section
      } 
    }
  })
}

function isValidResponse(
  state: ConversationStateHandler,
  messageBody: string
): boolean {
  switch (state.type) {
    case "select": {
      return !!findMatchingOption(state, messageBody);
    }
    case "list":
      return true;
    case "date": {
      const [day, month, year] = messageBody.split("/");
      // deno-lint-ignore no-unused-vars
      const date = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`
      );
      // TODO
      // return isValid(date);
      return true;
    }
    case "string": {
      return (
        !!messageBody && (!state.validation || state.validation(messageBody))
      );
    }
    default: {
      return false;
    }
  }
}

function stringSendable(messageBody: string): WhatsAppSendableString {
  return {
    type: "string",
    messageBody,
  };
}

export function formatMessageToSend(
  patientMessage: UnhandledPatientMessage
): WhatsAppSendable {
  console.log("formatMessageToSend", JSON.stringify(patientMessage));
  const state = conversationStates[patientMessage.conversation_state!];
  const prompt =
    typeof state.prompt === "string"
      ? state.prompt
      : state.prompt(patientMessage);

  switch (state.type) {
    case "select": {
      return {
        type: "buttons",
        messageBody: prompt,
        buttonText: "Menu",
        options: state.options.map((option) => ({
          id: option.option,
          title: option.display,
        })),
      };
    }
    // Need to modify the return simlier to select case
    case "list": {
      console.log("line 105: in determineNextPatientState");
      return {
        type: "list",
        messageBody: prompt,
        headerText: "Other Apponitment Times",
        action: {
          button: state.action.button,
          sections: state.action.sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description,
            })),
          })),
        },
      };
    }
    case "date": {
      return stringSendable(
        prompt + " Please enter the date in the format DD/MM/YYYY"
      ); // https://en.wikipedia.org/wiki/Date_format_by_country
    }
    case "string": {
      return stringSendable(prompt);
    }
    case "end_of_demo": {
      return stringSendable(prompt);
    }
    default: {
      return stringSendable("What happened!?!?!?!?!?");
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
  patientMessage: UnhandledPatientMessage
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
  // need to handle options for list here
  let onResponse
  if (currentState.type === "select"){
    onResponse = findMatchingOption(currentState, messageBody)!.onResponse
  } else if (currentState.type === "list"){
    console.log('onResponse is passing type list.')
    onResponse = findMatchingListOption(currentState, messageBody)!.onResponse
  } else{
    onResponse = currentState.onResponse
  }

  currentState.type === "list" ? { nextState: onResponse } : currentState;

  const next =
    typeof onResponse === "string"
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
      status: patientMessage.scheduling_appointment_status!,
      ...next.appointmentUpdates,
    };

  const toReturn: DetermineNextPatientStateValidReturn = { nextPatient };
  if (nextAppointment) {
    toReturn.nextAppointment = nextAppointment;
  }

  return toReturn;
}
