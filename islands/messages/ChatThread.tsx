import Avatar from '../../components/library/Avatar.tsx'
import {
  RenderedMessage,
  RenderedMessageThreadWithAllMessages,
} from '../../types.ts'
import cls from '../../util/cls.ts'
import { initials } from '../../util/initials.ts'
import { useSignal } from '@preact/signals'

// TODO support system messages
function SingleMessage({ message, thread }: {
  message: RenderedMessage
  thread: RenderedMessageThreadWithAllMessages
}) {
  return (
    <div
      className={cls(
        'p-3 rounded-lg',
        message.sender.is_me
          ? 'col-start-6 col-end-13'
          : 'col-start-1 col-end-8',
      )}
    >
      <div className='flex flex-row items-center'>
        <a href={message.sender.href}>
          <Avatar
            src={message.sender.avatar_url}
            initials={initials(message.sender.name)}
          />
        </a>
        <div className='relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl'>
          <div>{message.body}</div>
          {message.id === thread.last_message_read_by_everyone_else_id && (
            <div className='absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-gray-500'>
              Seen
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageSendForm({ onSubmit }: {
  onSubmit(message: string): void
}) {
  return (
    <form
      id='message-send-form'
      method='POST'
      className='flex flex-row items-center h-16 rounded-xl bg-white w-full px-4'
      onSubmit={(event) => {
        const message = event.currentTarget.elements.namedItem(
          'message',
        ) as HTMLInputElement
        onSubmit(message.value)
        setTimeout(() => {
          ;(document.getElementById('message-send-form') as HTMLFormElement)
            .reset()
        }, 0)
      }}
    >
      <div>
        <button className='flex items-center justify-center text-gray-400 hover:text-gray-600'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
            />
          </svg>
        </button>
      </div>
      <div className='flex-grow ml-4'>
        <div className='relative w-full'>
          <input
            type='text'
            name='message'
            className='flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10'
            value={undefined}
            required
          />
          <button className='absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600'>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>
        </div>
      </div>
      <div className='ml-4'>
        <button
          type='submit'
          className='flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0'
        >
          <span>Send</span>
          <span className='ml-2'>
            <svg
              className='w-4 h-4 transform rotate-45 -mt-px'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
              />
            </svg>
          </span>
        </button>
      </div>
    </form>
  )
}

export function ChatThread(
  { thread }: { thread: RenderedMessageThreadWithAllMessages },
) {
  const messages = useSignal(thread.messages)

  return (
    <div className='flex h-screen antialiased text-gray-800'>
      <div className='flex flex-row h-full w-full overflow-x-hidden'>
        <LeftPanel />
        <div className='flex flex-col flex-auto h-full p-6'>
          <div className='flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4'>
            <div className='flex flex-col h-full overflow-x-auto mb-4'>
              <div className='flex flex-col h-full'>
                <div className='grid grid-cols-12 gap-y-2'>
                  {messages.value.map((message) => (
                    <SingleMessage
                      key={message.id}
                      message={message}
                      thread={thread}
                    />
                  ))}
                </div>
              </div>
            </div>
            <MessageSendForm
              onSubmit={(message: string) => {
                messages.value = [
                  {
                    read_by_me_at: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                    thread_id: thread.id,
                    id: `new-${messages.value.length}`,
                    body: message,
                    read_by_others: [],
                    sender: thread.participants.find((p) => p.is_me)!,
                  },
                  ...messages.value,
                ]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function LeftPanel() {
  return (
    <div className='flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0'>
      <div className='flex flex-row items-center justify-center h-12 w-full'>
        <div className='flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10'>
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
            />
          </svg>
        </div>
        <div className='ml-2 font-bold text-2xl'>QuickChat</div>
      </div>
      <div className='flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg'>
        <div className='h-20 w-20 rounded-full border overflow-hidden'>
          <img
            src='https://avatars3.githubusercontent.com/u/2763884?s=128'
            alt='Avatar'
            className='h-full w-full'
          />
        </div>
        <div className='text-sm font-semibold mt-2'>Aminos Co.</div>
        <div className='text-xs text-gray-500'>Lead UI/UX Designer</div>
        <div className='flex flex-row items-center mt-3'>
          <div className='flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full'>
            <div className='h-3 w-3 bg-white rounded-full self-end mr-1' />
          </div>
          <div className='leading-none ml-1 text-xs'>Active</div>
        </div>
      </div>
      <div className='flex flex-col mt-8'>
        <div className='flex flex-row items-center justify-between text-xs'>
          <span className='font-bold'>Active Conversations</span>
          <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
            4
          </span>
        </div>
        <div className='flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto'>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full'>
              H
            </div>
            <div className='ml-2 text-sm font-semibold'>Henry Boyd</div>
          </button>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full'>
              M
            </div>
            <div className='ml-2 text-sm font-semibold'>Marta Curtis</div>
            <div className='flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none'>
              2
            </div>
          </button>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-orange-200 rounded-full'>
              P
            </div>
            <div className='ml-2 text-sm font-semibold'>Philip Tucker</div>
          </button>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-pink-200 rounded-full'>
              C
            </div>
            <div className='ml-2 text-sm font-semibold'>Christine Reid</div>
          </button>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-purple-200 rounded-full'>
              J
            </div>
            <div className='ml-2 text-sm font-semibold'>Jerry Guzman</div>
          </button>
        </div>
        <div className='flex flex-row items-center justify-between text-xs mt-6'>
          <span className='font-bold'>Archivied</span>
          <span className='flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full'>
            7
          </span>
        </div>
        <div className='flex flex-col space-y-1 mt-4 -mx-2'>
          <button className='flex flex-row items-center hover:bg-gray-100 rounded-xl p-2'>
            <div className='flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full'>
              H
            </div>
            <div className='ml-2 text-sm font-semibold'>Henry Boyd</div>
          </button>
        </div>
      </div>
    </div>
  )
}
