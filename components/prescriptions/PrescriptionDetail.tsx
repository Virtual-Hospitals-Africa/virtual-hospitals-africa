type prescriptionDetailProp = {
  heading: string
  information: string
}

export default function PrescriptionDetail(
  { heading, information }: prescriptionDetailProp,
) {
  return (
    <div className='mb-4 w-1/2'>
      <p className='text-purple-900 font-semibold'>{heading}</p>
      <p>{information}</p>
    </div>
  )
}
