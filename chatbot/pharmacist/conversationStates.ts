// TODO: Implement!
import {
  ConversationStates,
  PharmacistConversationState,
  PharmacistState,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as organizations from '../../db/models/organizations.ts'

const conversationStates: ConversationStates<
  PharmacistConversationState,
  PharmacistState
> = {
  'initial_message': {
    type: 'initial_message',
    nextState: 'not_onboarded:enter_registration',
    prompt() {
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
    prompt(pharmacistState: PharmacistState): string {
      return `Thank you ${
        pharmacistState.name!.split(' ')[0]
      }! To confirm your identity, please provide your ID number`
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
    prompt(pharmacistState: PharmacistState): string {
      return `Please confirm your pin ${pharmacistState.pin}`
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
    async onEnter(
      trx: TrxOrDb,
      pharmacistState: PharmacistState,
    ): Promise<PharmacistState> {
      assert(pharmacistState.organization_id, 'Organization ID should be set')
      const organization = await organizations.get(trx, {
        ids: [pharmacistState.organization_id],
      })
      return {
        ...pharmacistState,
        organization: organization[0],
      }
    },
    prompt(pharmacistState: PharmacistState): string {
      assert(pharmacistState.organization, 'Organization should not be null')
      return `You are serving patients from ${pharmacistState.organization.name} Please enter the patient's order number`
    },
    nextState: 'onboarded:get_order_details',
  },
  'onboarded:get_order_details': {
    type: 'string',
    prompt: 'To implement',
    nextState: 'other_end_of_demo',
  },
  'other_end_of_demo': {
    type: 'end_of_demo',
    prompt: 'This is the end of the demo. Thank you for participating!',
    nextState: 'other_end_of_demo',
  },
}

export default conversationStates
