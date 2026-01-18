export function Separator({ text }: { text?: string }) {
  return (
    <div class='flex items-center gap-4 my-4'>
      <div class='flex-1 border-t border-gray-300' />
      {text && (
        <>
          <span class='text-gray-500'>OR</span>
          <div class='flex-1 border-t border-gray-300' />
        </>
      )}
    </div>
  )
}
