import { assert } from 'std/assert/assert.ts'
import * as whatsapp from '../external-clients/whatsapp.ts'
import respond from './respond.ts'
import { chatbotToPhone } from './phone_numbers.ts'

type Chatbot = 'patient' | 'pharmacist'

export type Responder = { start(): void; exit(): void }

export function createChatbot(chatbot_name: Chatbot): Responder {
  let timer: number

  console.log('chatbot_name', chatbot_name)

  async function respondAndSetTimer(): Promise<void> {
    await respond(
      {
        ...whatsapp,
        phone_number: chatbotToPhone[chatbot_name],
      },
      chatbot_name,
    )
    timer = setTimeout(respondAndSetTimer, 100)
  }
  return {
    start: () => {
      console.log('Starting chatbot')
      respondAndSetTimer()
    },
    exit(): void {
      console.log('Exiting chatbot')
      clearTimeout(timer)
    },
  }
}

function assertChatbotName(
  chatbot_name: string,
): asserts chatbot_name is Chatbot {
  assert(
    chatbot_name === 'patient' || chatbot_name === 'pharmacist',
    'invalid chatbot argument',
  )
}

if (import.meta.main) {
  const [chatbot_name] = Deno.args
  assertChatbotName(chatbot_name)
  createChatbot(chatbot_name).start()
}
