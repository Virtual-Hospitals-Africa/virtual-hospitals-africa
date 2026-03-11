// function ProgressHeader({
//   completed_count,
//   total_count,
// }: {
//   completed_count: number
//   total_count: number
// }) {
//   const percentage = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0
//   const progress_color = percentage === 100 ? 'bg-green-500' : 'bg-indigo-700'
//   const badge_color = percentage === 100 ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'

//   return (
//     <div class='flex flex-col gap-3.5'>
//       <div class='flex items-start justify-between'>
//         <p class='text-lg font-normal text-gray-600 leading-7'>
//           {completed_count}/{total_count} tasks done
//         </p>
//         <div class={`px-4 py-0.5 rounded-full ${badge_color}`}>
//           <span class='text-xs font-medium'>
//             {percentage}%
//           </span>
//         </div>
//       </div>
//       {/* Progress bar */}
//       <div class='flex gap-3 items-center w-full'>
//         <div class='flex-1 h-1 bg-gray-200 rounded-full min-h-px min-w-px relative'>
//           <div
//             class={`absolute h-1 rounded-full ${progress_color}`}
//             style={{ width: `${percentage}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }
