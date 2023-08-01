import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import { resetInTest } from '../../../db/reset.ts'
import db from '../../../db/db.ts'
import respond from '../../../chatbot/respond.ts'
import * as conversations from '../../../db/models/conversations.ts'
import * as patients from '../../../db/models/patients.ts'

// TODO: facilities list will change based on facility table
describe('patient chatbot', () => {
  beforeEach(resetInTest)
  afterEach(() => db.destroy())
  it('It sends nearest facilities list after invitation', async () => {
    await patients.upsert(db, {
      conversation_state: 'find_nearest_facility:share_location',
      phone_number: '00000000',
      name: 'test',
      gender: 'female',
      date_of_birth: '1111/11/11',
      national_id_number: '',
    })

    await conversations.insertMessageReceived(db, {
      patient_phone_number: '00000000',
      has_media: false,
      // Somewhere in Harare
      body: JSON.stringify({
        latitude: -17.832132339478,
        longitude: 31.047979354858,
      }),
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
    //console.log(fakeWhatsApp.sendMessages.firstCall.args[0].messages.action)
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          type: 'list',
          headerText: 'Nearest Facilities',
          messageBody: 'Thank you for sharing your location.\n' +
            '\n' +
            'Click the button below to see your nearest health facilities.',
          action: {
            button: 'Nearest Facilities',
            sections: [
              {
                title: 'Town Name Here',
                rows: [
                  {
                    id: '656',
                    title: 'Arcadia',
                    description: 'Harare, Harare Province, ZW (2.3 km)',
                  },
                  {
                    id: '657',
                    title: 'Braeside',
                    description: '4 General Booth Rd, Harare, ZW (3.4 km)',
                  },
                  {
                    id: '1686',
                    title: 'WILKINS infectious Ho...',
                    description: '52JH+JV3, Weale Rd, Harare, ZW (3.3 km)',
                  },
                  {
                    id: '652',
                    title: 'Belvedere',
                    description: '52JF+2FH, Burton Rd, Harare, ZW (3.7 km)',
                  },
                  {
                    id: '630',
                    title: 'Matapi',
                    description: 'Harare Rd, Harare, ZW (3.5 km)',
                  },
                  {
                    id: '638',
                    title: 'Mbare ',
                    description: '42RP+45G, Third Ave, Harare, ZW (4.1 km)',
                  },
                  {
                    id: '648',
                    title: 'Beatrice Infectious',
                    description:
                      'Infectious Diseases Hospital, 423 simon Maozorodze, Harare, ZW (4.0 km)',
                  },
                  {
                    id: '639',
                    title: 'Mbare hostels',
                    description: 'Harare, Harare Province, ZW (4.5 km)',
                  },
                  {
                    id: '655',
                    title: 'Sunningdale',
                    description:
                      '43H3+7CP Sunningdale Community Centre, 2nd Rd, Harare, ZW (5.0 km)',
                  },
                  {
                    id: '658',
                    title: 'Eastly',
                    description: '3 Worcester Rd, Harare, ZW (4.4 km)',
                  },
                ],
              },
            ],
          },
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
      'find_nearest_facility:got_location',
    )
  })
})
