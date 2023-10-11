import { CheckIcon } from '../components/library/CheckIcon.tsx'
import CrossIcon from '../components/library/icons/cross.tsx'
import { useState } from 'preact/hooks'

interface ApproveSuccessProps {
  approved: string | null
}

export default function ApproveSuccess({ approved }: ApproveSuccessProps) {
  const [isApprovedVisible, setIsApprovedVisible] = useState(!!approved)
  return (
    <>
      {isApprovedVisible && (
        <div className='rounded-md bg-green-50 p-4 mt-4 mb-4'>
          <div className='flex justify-between'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckIcon
                  className='h-5 w-5 text-green-400'
                  aria-hidden='true'
                />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-green-800'>
                  Successfully approved registration for {approved}
                </h3>
              </div>
            </div>
            <div className='ml-auto'>
              <CrossIcon
                type='button'
                className='text-green-400'
                onClick={() => setIsApprovedVisible(false)}
              >
              </CrossIcon>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
