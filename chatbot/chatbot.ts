import respond from './respond.ts'

export type Responder = { start(): void; exit(): void }

export function createChatbot(): Responder {
  let timer: number

  // TODO: handle receiving more than one message in a row from same patient
  async function respondAndSetTimer(): Promise<void> {
    await respond()
    // TODO: it seems like this recursion might be causing a memory leak?
    // A setInterval isn't quite right because we want to wait for the
    // previous batch of messages to be done processing before starting again.
    timer = setTimeout(respondAndSetTimer, 100)
  }
  // console.log('Line 50: chatbot at return')
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

createChatbot().start()
