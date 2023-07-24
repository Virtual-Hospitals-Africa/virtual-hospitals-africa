import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import reset from "../../../db/reset.ts";
import db from "../../../db/db.ts";
import respond from "../../../chatbot/respond.ts";
import * as conversations from '../../../db/models/conversations.ts'
import * as patients from '../../../db/models/patients.ts'

describe('patient chatbot', () => {
    beforeEach(reset)
    afterEach(() => db.destroy())
    it('It sends share-location after welcome message', async () => {
        await patients.upsert(db, {
          conversation_state: 'not_onboarded:welcome',
          phone_number: '00000000',
          name: 'test',
          gender: 'female',
          date_of_birth: '1111/11/11',
          national_id_number: '',
        })
    
        await conversations.insertMessageReceived(db, {
          patient_phone_number: '00000000',
          has_media: false,
          body: 'find_nearest_facility',
          media_id: null,
          whatsapp_id: 'whatsapp_id',
        })
    
        const fakeWhatsApp = {
          sendMessage: sinon.stub().throws(),
          sendMessages: sinon.stub().resolves([{
            messages: [{
              id: 'wamid.1234',
            }],
          }]),
        }
    
        await respond(fakeWhatsApp)
        console.log(fakeWhatsApp.sendMessages.firstCall.args)
        assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
          {
            messages: {
              type: 'string',
              messageBody:
                'Sure, we can find your nearest facility. Can you share your location?',
            },
            phone_number: '00000000',
          },
        ])
        const patient = await patients.getByPhoneNumber(db, {
          phone_number: '00000000',
        })
    
        assert(patient)
        assertEquals(
          patient.conversation_state,
          'find_nearest_facility:share_location',
        )
      })
})