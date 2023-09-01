// add appropriate styles

import { AddIcon, RemoveIcon } from './icons/add-remove-buttons.tsx'

interface IconButtonProps {
  iconType: 'add' | 'remove'
}

export default function IconButton(props: IconButtonProps) {
  const IconComponent = props.iconType == 'add' ? AddIcon : RemoveIcon

  return (
    <button className='text-white rounded-full'>
      <IconComponent />
    </button>
  )
}
