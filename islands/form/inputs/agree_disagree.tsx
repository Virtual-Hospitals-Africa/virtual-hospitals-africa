import { Maybe } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import {
  CheckCircleIcon,
  XCircleIcon,
} from '../../../components/library/icons/heroicons/outline.tsx'

export function AgreeDisagreeQuestion({
  name,
  value,
  onChange,
}: {
  name?: string
  value?: Maybe<'agree' | 'disagree'>
  onChange?(value: 'agree' | 'disagree'): void
}) {
  return (
    <fieldset className='flex text-indigo-600'>
      <label for={`${name}-agree`} className='cursor-pointer'>
        <CheckCircleIcon
          className={cls('w-5 h-5', value === 'agree' && 'stroke-3')}
        />
        <input
          name={name}
          type='radio'
          checked={value === 'agree'}
          className='hidden'
          value='agree'
          id={`${name}-agree`}
          onChange={() => onChange?.('agree')}
        />
      </label>
      <label for={`${name}-disagree`} className='cursor-pointer'>
        <XCircleIcon
          className={cls('w-5 h-5', value === 'disagree' && 'stroke-3')}
        />
        <input
          name={name}
          type='radio'
          checked={value === 'disagree'}
          className='hidden'
          value='disagree'
          id={`${name}-disagree`}
          onChange={() => onChange?.('disagree')}
        />
      </label>
    </fieldset>
  )
}
