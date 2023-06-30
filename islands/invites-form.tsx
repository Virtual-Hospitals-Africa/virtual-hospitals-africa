import { useState } from 'preact/hooks'
import range from '../util/range.ts'

export default function InviteEmployeesForm() {
  const [totalInvites, setTotalInvites] = useState(1)

  return (
    <form style={{ maxWidth: '800px', margin: '0 auto' }} method='POST'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 20px',
        }}
      >
        <div style={{ width: '45%' }} className='mt-4'>
          <label
            htmlFor='email'
            className='block text-sm font-medium leading-6 text-gray-500'
          >
            Email<span style={{ color: 'gray' }}>*</span>
          </label>
          {range(0, totalInvites).map((index) => (
            <div className='mt-2 mb-2'>
              <input
                type='email'
                name={`${index}.email`}
                id={`email-${index}`}
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-1'
                placeholder='you@example.com'
                required={index === 0 || index !== totalInvites - 1}
              />
            </div>
          ))}
        </div>
        <div style={{ width: '45%' }} className='mt-4'>
          <label
            htmlFor='profession'
            className='block text-sm font-medium leading-6 text-gray-500'
          >
            Profession<span style={{ color: 'gray' }}>*</span>
          </label>
          {range(0, totalInvites).map((index) => (
            <div className='mt-2 mb-2'>
              <select
                id={`profession-${index}`}
                name={`${index}.profession`}
                className='block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                style={{ height: '2.5rem' }}
                required={index === 0 || index !== totalInvites - 1}
                onSelect={() => {
                  const isLast = index === totalInvites - 1
                  const othersAllFilled = true
                  if (isLast && othersAllFilled) {
                    setTotalInvites(totalInvites + 1)
                  }
                }}
                onChange={() => {
                  console.log('onChange')
                  const isLast = index === totalInvites - 1
                  const othersAllFilled = true
                  if (isLast && othersAllFilled) {
                    setTotalInvites(totalInvites + 1)
                  }
                }}
              >
                <option value=''>--Choose a profession--</option>
                <option>
                  {'nurse'.charAt(0).toUpperCase() + 'nurse'.slice(1)}
                </option>
                <option>
                  {'doctor'.charAt(0).toUpperCase() + 'doctor'.slice(1)}
                </option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <hr style={{ margin: '20px 0' }} />
      <div style={{ textAlign: 'right', margin: '0 20px' }}>
        <button
          type='submit'
          className='rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
        >
          Invite
        </button>
      </div>
    </form>
  )
}
