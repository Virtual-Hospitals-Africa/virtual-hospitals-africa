import { JSX } from 'preact'
import { useSignal } from '@preact/signals'
import cls from '../../util/cls.ts'
import { RenderedMessageThread } from '../../types.ts'

type ThreadListProps = {
  threads: RenderedMessageThread[]
}

// function MessageContent(content: string): JSX.Element {
//   return (
//     <article class='py-3 px-2 bg-white'>
//       {content}
//     </article>
//   )
// }

function MessageControllers(): JSX.Element {
  return (
    <div class='flex items-center'>
      <span class='bg-gray-300 h-6 w-[.5px] mx-3'></span>
      <div class='flex items-center space-x-2'>
        <button
          title='Delete'
          class='text-gray-700 px-2 py-1 border border-gray-300 rounded-lg shadow hover:bg-gray-200 transition duration-100'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
            >
            </path>
          </svg>
        </button>
        <button
          title='Mark As Read'
          class='text-gray-700 px-2 py-1 border border-gray-300 rounded-lg shadow hover:bg-gray-200 transition duration-100'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76'
            >
            </path>
          </svg>
        </button>
        <button
          title='Mark As Unread'
          class='text-gray-700 px-2 py-1 border border-gray-300 rounded-lg shadow hover:bg-gray-200 transition duration-100'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            class='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            >
            </path>
          </svg>
        </button>
      </div>
    </div>
  )
}

type SingleMessageProps = {
  thread: RenderedMessageThread
  isSelected: boolean
  toggleSelection(): void
}

function SingleThread({
  thread,
  isSelected,
  toggleSelection,
}: SingleMessageProps): JSX.Element {
  // TODO
  return (
    <details class={cls(thread.most_recent_message.read_at && 'bg-gray-100')}>
      <summary class='marker:content-[""] [&::-webkit-details-marker]:hidden'>
        <div class='flex items-center border-y hover:bg-gray-200 px-2'>
          <input
            onInput={toggleSelection}
            checked={isSelected}
            type='checkbox'
            class='border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 border-1 rounded-sm'
          />
          <div class='w-full flex items-center justify-between p-1 my-1 cursor-pointer'>
            <div class='flex items-center'>
              <span class='w-56 ml-2 pr-2 truncate'>
                {thread.most_recent_message.sender.name}
              </span>
              <span class='w-96 text-gray-600 text-sm truncate'>
                {thread.most_recent_message.body}
              </span>
            </div>
            <div class='w-32 flex items-center justify-end'>
              <span x-show='!messageHover' class='text-sm text-gray-500'>
                {thread.most_recent_message.created_at.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </summary>
      {/* <Message */}
    </details>
  )
}

export default function ThreadList(
  { threads }: ThreadListProps,
): JSX.Element {
  const isSelectAll = useSignal<boolean>(false)
  const selected = useSignal<Set<RenderedMessageThread>>(new Set())

  return (
    <>
      <div class='h-16 px-2 flex items-center justify-between border-b'>
        <div class='flex items-center'>
          <input
            checked={isSelectAll.value}
            type='checkbox'
            class='border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 border-1 rounded-sm'
            onInput={() => {
              const isSelectedAll = isSelectAll.value
              isSelectAll.value = !isSelectedAll
              selected.value = new Set(isSelectedAll ? [] : threads)
            }}
          />
          {MessageControllers()}
        </div>
      </div>
      {threads.map((thread) => (
        <SingleThread
          thread={thread}
          isSelected={selected.value.has(thread)}
          toggleSelection={() => {
            const newSelected = new Set(selected.value)
            selected.value.has(thread)
              ? newSelected.delete(thread)
              : newSelected.add(thread)
            selected.value = newSelected
            isSelectAll.value = selected.value.size === threads.length
          }}
        />
      ))}
    </>
  )
}
