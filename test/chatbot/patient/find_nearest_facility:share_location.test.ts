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
    console.log(fakeWhatsApp.sendMessages.firstCall.args[0].messages.action)
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
                    id: '8',
                    title: 'Majini',
                    description:
                      'Makado, Gwanda, Matabeleland South Province, ZW (531 km)',
                  },
                  {
                    id: '2',
                    title: 'Chamunangana',
                    description:
                      'Sitauzis, Gwanda, Matabeleland South Province, ZW (550 km)',
                  },
                  {
                    id: '3',
                    title: 'Chasvingo',
                    description:
                      'Beitbridge, Matabeleland South Province, ZW (524 km)',
                  },
                  {
                    id: '5',
                    title: 'Chituripasi',
                    description:
                      'Tshiturapadsi, Beitbridge, Matabeleland South Province, ZW (547 km)',
                  },
                  {
                    id: '9',
                    title: 'Makakabule',
                    description:
                      'Beitbridge, Matabeleland South Province, ZW (562 km)',
                  },
                  {
                    id: '6',
                    title: 'Dite',
                    description:
                      'Sinyoni, Beitbridge, Matabeleland South Province, ZW (546 km)',
                  },
                  {
                    id: '4',
                    title: 'Chikwarakwara',
                    description:
                      'Beitbridge, Matabeleland South Province, ZW (582 km)',
                  },
                  {
                    id: '1',
                    title: 'Beitbridge',
                    description:
                      'Beitbridge, Matabeleland South Province, ZW (555 km)',
                  },
                  {
                    id: '7',
                    title: 'Dulibadzimu',
                    description:
                      'Shop number 6, Tsumbo Complex Dulivadzimu, Beitbridge, ZW (556 km)',
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
