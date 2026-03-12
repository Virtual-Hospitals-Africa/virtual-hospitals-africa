import { RenderedTask } from '../../../types.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function JustDoItTask({
  task,
}: {
  task: RenderedTask & { atom: 'link' }
}) {
  const name = `just_do_it_tasks.${uniqueIdentifier(task)}`

  return (
    <label class='flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors'>
      <div class='flex items-center justify-center px-0 py-0.5 w-5'>
        <div class='flex items-center justify-center rounded'>
          <input
            id={name}
            type='checkbox'
            name={name}
            value='true'
            // checked={task.completed}
            class='w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700'
          />
        </div>
      </div>
      <div class='flex gap-1'>
        <span class='text-sm font-medium text-gray-600 leading-5'>
          <a href={task.href} className='flex'>
            {task.title}
            {task.thumbnail_href && <img width='200' src={task.thumbnail_href} />}
          </a>
        </span>
      </div>
    </label>
  )
}
