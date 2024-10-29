import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from './icons/heroicons/solid.tsx'
import cls from '../../util/cls.ts'
import range from '../../util/range.ts'

type PaginationProps = {
  has_next_page: boolean
  page: number
}

function PageNumber(
  { page, is_current }: { page: number; is_current: boolean },
) {
  return (
    <button
      type='submit'
      name='page'
      value={page}
      className={cls(
        'inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium',
        is_current
          ? 'text-indigo-600 border-indigo-500'
          : 'text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
    >
      {page}
    </button>
  )
}

function Ellipsis() {
  return (
    <span className='inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500'>
      ...
    </span>
  )
}

export default function Pagination({
  has_next_page,
  page,
}: PaginationProps) {
  const primary_page_range = range(Math.max(1, page - 2), page + 1)
  if (has_next_page) {
    primary_page_range.push(page + 1)
  }

  return (
    <nav className='flex items-center justify-between border-t border-gray-200 px-4 sm:px-0'>
      <div className='-mt-px flex w-0 flex-1'>
        <button
          type='submit'
          name='page'
          value={page - 1}
          className='inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
          disabled={page === 1}
        >
          <ArrowLongLeftIcon
            aria-hidden='true'
            className='mr-3 h-5 w-5 text-gray-400'
          />
          Previous
        </button>
      </div>
      <div className='hidden md:-mt-px md:flex'>
        {primary_page_range[0] > 1 && (
          <>
            <PageNumber page={1} is_current={false} />
            <Ellipsis />
          </>
        )}
        {primary_page_range.map((p) => (
          <PageNumber key={p} page={p} is_current={p === page} />
        ))}
        {has_next_page && <Ellipsis />}
      </div>
      <div className='-mt-px flex w-0 flex-1 justify-end'>
        <button
          type='submit'
          name='page'
          value={page + 1}
          className='inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
          disabled={!has_next_page}
        >
          Next
          <ArrowLongRightIcon
            aria-hidden='true'
            className='ml-3 h-5 w-5 text-gray-400'
          />
        </button>
      </div>
    </nav>
  )
}
