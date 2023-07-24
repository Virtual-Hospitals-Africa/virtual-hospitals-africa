import { afterEach, beforeEach, describe, it } from 'std/testing/bdd.ts'
import { assert, assertEquals } from 'std/testing/asserts.ts'
import sinon from 'npm:sinon'
import db from '../../db/db.ts'
import reset from '../../db/reset.ts'
import * as conversations from '../../db/models/conversations.ts'
import * as patients from '../../db/models/patients.ts'
import respond from '../../chatbot/respond.ts'

describe('patient chatbot', () => {
  // beforeEach(reset)
  let beforeTestResources: Deno.ResourceMap

  beforeEach(async () => {
    beforeTestResources = Deno.resources()

    await reset()
  })

  afterEach(async () => {
    await db.destroy()
    const afterTestResources = Deno.resources()
    console.log('Before Test Resources:', beforeTestResources);
    console.log('After Test Resources:', afterTestResources);
    for (const rid in afterTestResources) {
      if (rid in beforeTestResources) {
        continue
      }
      if (
        afterTestResources[rid] === 'tcpListener' ||
        afterTestResources[rid] === 'tcpStream'
      ) {
        console.log('Closing resource with rid:', rid);
        Deno.close(Number(rid))
      }
    }
  })
  // afterEach(() => db.destroy())
  it('It sends the main menu after the initial message', async () => {
    await conversations.insertMessageReceived(db, {
      patient_phone_number: '2369961017',
      has_media: false,
      body: 'body',
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
    assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
      {
        messages: {
          messageBody:
            'Welcome to Virtual Hospitals Africa. What can I help you with today?',
          type: 'buttons',
          buttonText: 'Menu',
          options: [
            { id: 'make_appointment', title: 'Make Appointment' },
            { id: 'find_nearest_facility', title: 'Nearest Facility' },
          ],
        },
        phone_number: '2369961017',
      },
    ])
    const patient = await patients.getByPhoneNumber(db, {
      phone_number: '2369961017',
    })

    assert(patient)
    assertEquals(patient.conversation_state, 'not_onboarded:welcome')
  })

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

    it('It sends nearest-facilities after invite-share-location', async () => {
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
        body: JSON.stringify({latitude:-17.832132339478,longitude:31.047979354858}),
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
      console.log(fakeWhatsApp.sendMessages.firstCall.args[0].messages.action.sections)
      assertEquals(fakeWhatsApp.sendMessages.firstCall.args, [
        {
          messages: {
            type: 'list',
            headerText:"Nearest Facilities",
            messageBody:"Thank you for sharing your location.\n" +
            "\n" +
            "Click the button below to see your nearest health facilities.",
            action: { button: "Nearest Facilities",sections: [
              {
                title: "Town Name Here",
                rows: [
                  {
                    id: "8",
                    title: "Majini",
                    description: "Makado, Gwanda, Matabeleland South Province, ZW (430.6km)"
                  },
                  {
                    id: "2",
                    title: "Chamunangana",
                    description: "Sitauzis, Gwanda, Matabeleland South Province, ZW (444.5km)"
                  },
                  {
                    id: "3",
                    title: "Chasvingo",
                    description: "Beitbridge, Matabeleland South Province, ZW (471.0km)"
                  },
                  {
                    id: "5",
                    title: "Chituripasi",
                    description: "Tshiturapadsi, Beitbridge, Matabeleland South Province, ZW (484.4km)"
                  },
                  {
                    id: "9",
                    title: "Makakabule",
                    description: "Beitbridge, Matabeleland South Province, ZW (490.6km)"
                  },
                  {
                    id: "6",
                    title: "Dite",
                    description: "Sinyoni, Beitbridge, Matabeleland South Province, ZW (490.8km)"
                  },
                  {
                    id: "4",
                    title: "Chikwarakwara",
                    description: "Beitbridge, Matabeleland South Province, ZW (496.5km)"
                  },
                  {
                    id: "1",
                    title: "Beitbridge",
                    description: "Beitbridge, Matabeleland South Province, ZW (496.6km)"
                  },
                  {
                    id: "7",
                    title: "Dulibadzimu",
                    description: "Shop number 6, Tsumbo Complex Dulivadzimu, Beitbridge, ZW (496.9km)"
                  }
                ]
              }
            ]}
          },
          phone_number: '00000000',
        }
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
