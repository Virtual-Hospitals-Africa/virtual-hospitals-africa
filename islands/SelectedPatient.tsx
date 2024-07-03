import { JSX } from 'preact'

type SelectedPatientProps = {
  name: string
  description: string
  imageUrl: string
}

const SelectedPatient = (
  { name, description, imageUrl }: SelectedPatientProps,
): JSX.Element => {
  return (
    <div className='px-5 py-6'>
      <div className='flex items-center'>
        <img
          className='h-10 w-10 rounded-full mr-4'
          src={imageUrl}
          alt={name}
        />
        <div>
          <h2 className='text-sm font-sans font-medium text-gray-900 leading-normal'>
            {name}
          </h2>
          <p className='text-sm font-sans text-gray-500 leading-normal'>
            {description}
          </p>
          <p className='truncate text-xs font-ubuntu text-gray-500 whitespace-pre-line'>
            <a href='/Notes' className='text-blue-500'>Clinical Notes</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SelectedPatient
