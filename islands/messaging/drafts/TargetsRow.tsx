import { Signal, useSignal } from '@preact/signals'
import { useRef } from 'preact/hooks'
import RemovableChip from '../../../components/RemovableChip.tsx'
import { MessageTargetType } from '../../../db.d.ts'
import remove from '../../../util/remove.ts'
import useAsyncSearch from '../../useAsyncSearch.tsx'
import { MessageTargetCategory } from '../../../shared/message_targets.ts'
import AsyncSearch from '../../AsyncSearch.tsx'

type Target = {
  target_type: MessageTargetType
  display_name: string
  target_value: string
}

type TargetsRowProps = {
  label: string
  message_target_category: MessageTargetCategory
  targets: Target[]
}

// function TargetsInput<TargetType extends MessageTargetType>(
//   { targets_signal, message_target_category }: { 
//     message_target_category: MessageTargetCategory
//     targets_signal: Signal<Target[]> 
//   },
// ) {
//   const foo = useAsyncSearch({
//     search_route: `/app/messaging/targets?message_target_category=${message_target_category}`
//   })

//   const show_results = useSignal(false)
//   const input_ref = useRef<HTMLInputElement>(null)

//   const handleSelect = (target: Target) => {
//     targets_signal.value = [
//       ...targets_signal.value,
//       target
//     ]
//     foo.setQuery('')
//     show_results.value = false
//     input_ref.current?.focus()
//   }

//   return (
//     <div class='relative flex-1'>
//       <div class='flex flex-wrap gap-2 items-center bg-white'>
//         {targets_signal.value.map((target) => (
//           <RemovableChip
//             key={target}
//             name={`targets.${target.target_type}.${target.target_value}`}
//             display={target.display_name}
//             remove={() =>
//               targets_signal.value = remove(targets_signal.value, target)}
//           />
//         ))}
//         <input
//           ref={input_ref}
//           type='text'
//           class='flex-1 min-w-[200px] outline-none border-none focus:ring-0 p-0'
//           placeholder={targets_signal.value.length ? `Search ${message_target_category}` : ''}
//           value={foo.search.query}
//           onInput={(e) => {
//             foo.setQuery((e.currentTarget as HTMLInputElement).value)
//             show_results.value = true
//           }}
//           onFocus={() => show_results.value = true}
//           onBlur={() => {
//             // Delay to allow click events on results
//             setTimeout(() => show_results.value = false, 200)
//           }}
//         />
//       </div>
//       {show_results.value && .length > 0 && (
//         <div class='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
//           {filtered_results.map((result) => (
//             <button
//               key={`${result.target_type}-${result.target_value}`}
//               type='button'
//               onClick={() => handleSelect(result)}
//             >
//               <div class='font-medium'>{result.display_name}</div>
//               <div class='text-sm text-gray-500 capitalize'>
//                 {result.target_type.replace('_', ' ')}
//               </div>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

export function TargetsRow({
  label,
  message_target_category,
  targets,
}: TargetsRowProps) {
  const targets_signal = useSignal(targets)

  return (
    <div class='flex items-center gap-2 px-6 py-3 border-b border-gray-200'>
      <label class='text-sm text-gray-700 w-24 flex-shrink-0'>
        {label}
      </label>
      <div class='flex flex-col gap-2 flex-1'>
        <AsyncSearch
          name={`targets.${message_target_category}`}
          search_route={`/app/messaging/targets?message_target_category=${message_target_category}`}
          multi
          signal={targets_signal} 
        />
      </div>
    </div>
  )
}
