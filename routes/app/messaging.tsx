import { PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../types.ts'
import MessageList, { Message } from '../../islands/message/MessageList.tsx'
import { HealthWorkerHomePageLayout } from './_middleware.tsx'

type MessagingProps = {
  healthWorker: EmployedHealthWorker
}

const MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'John Doe',
    content:
      'Hello, I have a question about the prescription for the patient. Can you help me with that?',
    timestamp: '3:05 PM',
    isRead: true,
  },
  {
    id: '2',
    sender: 'Michael Smith',
    content: 'Thank you so much for the response',
    timestamp: '2:05 PM',
    isRead: false,
  },
]

export default HealthWorkerHomePageLayout(
  'Messaging',
  function MessagingPage(
    _req: Request,
    _ctx: PageProps<LoggedInHealthWorkerHandlerWithProps<MessagingProps>>,
  ) {
    return <MessageList messages={MESSAGES} />
  },
)
