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
  const [myArray, setMyArray] = useState<condition[]>([]);
  
  type condition  = {
    id: number
  }

  const showConditionSearchModule = () => {
    setIsShown(!isShown)
    setNumConditions(numConditions + 1)
  }

  ////////////
  //Trying Array Solution
  const handleAddClick = () => {
    const newId = myArray.length + 1;
    setMyArray([...myArray, { id: newId }]);
  };
  const handleRemoveClick = (id: number) => {
    setMyArray(myArray.filter(item => item.id !== id));
  };
  //////////

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
      {/* <button onClick={showConditionSearchModule} type="button"><AddIcon></AddIcon></button>
      {Array.from({ length: numConditions }, (_, index) => (
          <div key={index} className='flex flex-row'>
            <button type="button"><RemoveIcon></RemoveIcon></button>
            <ConditionSearchModule />
          </div>
      
      ))} */}
            

        {myArray.map((item) => (
          <div key = {item.id} className='flex flex-row'>
              <button onClick={() => handleRemoveClick(item.id)} className='mr-2'><RemoveIcon></RemoveIcon></button>
              <ConditionSearchModule/>
          </div>))}
          <button onClick={handleAddClick} type="button" className='flex flex-row text-[#4F46E5] font-bold'><AddIcon></AddIcon>Add Condition</button>

            




      
      
    
      {/* <button
            onClick={() => showConditionSearchModule()}
            className='flex flex-row gap-2 items-center justify-between rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 h-9 p-2 cursor-pointer'
          >
            
            <AddIcon />
          </button> */}
    </>
  )
}
