import type { InsuranceNetworkSearchOption } from '../types.ts'
import AsyncSearch, { AsyncSearchPropsSingular } from './AsyncSearch.tsx'
import cls from '../util/cls.ts'

function InsuranceOption({
  option,
  active,
}: {
  option: InsuranceNetworkSearchOption
  active: boolean
}) {
  return (
    <div
      className={cls(
        'flex items-center relative py-2 pl-3 pr-9',
        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
      )}
    >
      {/* Avatar (optional) */}
      {option.avatar_media_id && (
        <img
          src={option.avatar_media_id}
          className='w-8 h-8 rounded mr-3'
          alt={option.business_name}
        />
      )}

      {/* Insurance Name Only */}
      <div className='flex-1'>
        {option.business_name}
      </div>

      {/* Note: Checkmark is rendered by Search component, not here */}
    </div>
  )
}

export default function InsuranceSearch(
  props: Omit<
    AsyncSearchPropsSingular<InsuranceNetworkSearchOption>,
    'Option'
  >,
) {
  return <AsyncSearch {...props} Option={InsuranceOption} />
}
