import { Maybe } from '../../types.ts'

type PrescriptionDetailProps = {
  heading: string
  information: Maybe<string>
}

export default function PrescriptionDetail(
  { heading, information }: PrescriptionDetailProps,
) {
  if (!information) return null
  return (
    <div className='mb-4 w-1/2'>
      <p className='text-purple-900 font-semibold'>{heading}</p>
      <p>{information}</p>
    </div>
  )
}
