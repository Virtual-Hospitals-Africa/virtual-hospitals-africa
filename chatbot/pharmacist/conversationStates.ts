// TODO: Implement!
import {
  ConversationStateHandlerListAction,
  ConversationStateHandlerListActionSection,
  ConversationStates,
  PharmacistConversationState,
  PharmacistState,
  Location,
  Maybe,
  TrxOrDb,
  WhatsAppSendable,
  WhatsAppSingleSendable,
} from '../../types.ts'

const conversationStates: ConversationStates<PharmacistConversationState, PharmacistState
> = {
  'initial_message': {
    type: 'initial_message',
    nextState: 'not_onboarded:enter_registration',
    prompt(){
      throw new Error('Should not prompt for initial message')
    },
  },
  'not_onboarded:enter_registration': {
    type: 'string',
    prompt:
    'Hello! I am your virtual assistant and thank you for assisting our mutual client. To get started, please help us by providing your professional registration number',
    nextState: 'not_onboarded:enter_id',
},
'not_onboarded:enter_id': {
  type: 'string',
  prompt(pharmacist: PharmacistState): string {
    return `Thank you ${pharmacist.name!.split(' ')[0]}! To confirm your identity, please provide your ID number`
  },
  nextState: 'not_onboarded:create_pin',
},
'not_onboarded:create_pin': {
  type: 'string',
  prompt: 'Great! To secure your account, please create a 4-digit pin',
  nextState: 'not_onboarded:confirm_pin',
},
'not_onboarded:confirm_pin': {
  type: 'string',
  prompt(pharmacist: PharmacistState): string {
    return `Please confirm your pin ${pharmacist.pin}`
  },
  nextState: 'not_onboarded:enter_establishment',
},
'not_onboarded:enter_establishment': {
  type: 'string',
  prompt: 'Please provide your establishment license number',
  nextState: 'onboarded:enter_order_number',
},
'onboarded:enter_order_number': {
  type: 'string',
  prompt(pharmacist: PharmacistState): string {
    const establishment = get
    return `You are now serving as a pharmacist at ${pharmacist.establishment}. Please provide the order number`
  }
  nextState: 'onboarded:enter_order_date',
},
'other_end_of_demo': {
  type: 'end_of_demo',
  prompt: 'This is the end of the demo. Thank you for participating!',
  nextState: 'other_end_of_demo',
},
}