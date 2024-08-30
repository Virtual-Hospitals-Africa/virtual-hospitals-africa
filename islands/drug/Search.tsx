import { DrugSearchResult } from '../../types.ts'
import AsyncSearch, { AsyncSearchProps } from '../AsyncSearch.tsx'
import cls from '../../util/cls.ts'

function DrugOption({
  option,
  selected,
}: {
  option: DrugSearchResult
  selected: boolean
}) {
  return (
    <div className='flex items-center'>
      <span
        className={cls(
          'ml-3 truncate',
          selected && 'font-bold',
        )}
      >
        <b>{option.name}</b>
        {option.medications.map(
          (medication) => (
            <div>{medication.form_route} ({medication.strength_summary})</div>
          ),
        )}
        {option.distinct_trade_names.length > 0 && (
          <div className='text-s italic'>
            {option.distinct_trade_names.join(', ')}
          </div>
        )}
      </span>
    </div>
  )
}

export default function DrugSearch(
  props: Omit<AsyncSearchProps<DrugSearchResult>, 'Option' | 'href'>,
) {
  return (
    <AsyncSearch search_route='/app/drugs' {...props} Option={DrugOption} />
  )
}
