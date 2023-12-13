import { useEffect, useRef, useState } from 'preact/hooks'
import ConditionSearchModule from './ConditionSearchModule.tsx'
import RemoveIcon from '../components/library/icons/remove.tsx'
import AddIcon from '../components/library/icons/add.tsx'


export default function ConditionSearch() {
  const [isFocused, setIsFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [results, setResults] = useState<null | [string, string][]>(null)
  const [isShown, setIsShown] = useState(false)
  const [numConditions, setNumConditions] = useState (0)

  const showConditionSearchModule = () => {
    setIsShown(!isShown)
    setNumConditions(numConditions + 1)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInputRef.current &&
        event.target instanceof Node &&
        event.target !== searchInputRef.current &&
        searchInputRef.current !== event.target
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <button onClick={showConditionSearchModule} type="button">add condition</button>
      {/* {isShown && <ConditionSearchModule />} */}
      {Array.from({ length: numConditions }, (_, index) => (
        <ConditionSearchModule />
      ))}

      
      
    
      {/* <button
            onClick={() => showConditionSearchModule()}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
          >
            
            <AddIcon />
          </button> */}
    </>
  )
}
