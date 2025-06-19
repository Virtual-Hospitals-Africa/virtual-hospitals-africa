import { PatientPage } from '../_middleware.tsx'

export default PatientPage(
  'Patient Information > General',
  function GeneralPage(_req, _ctx) {
    return (
      <div class='p-6 max-w-4xl mx-auto'>
        <h2 class='text-2xl font-bold mb-6'>General</h2>
        <form class='space-y-6'>
          <div class='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <InputField label='Name' name='name' placeholder='Luke' />
            <InputField
              label='Middle Name'
              name='middleName'
              placeholder='Mandela'
            />
            <InputField label='Surname' name='surname' placeholder='Manusiya' />
          </div>

          <div class='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <InputField label='Date of Birth' name='dob' type='date' />
            <SelectField label='Sex' name='sex' options={['Male', 'Female']} />
            <SelectField
              label='Gender'
              name='gender'
              options={['He/Him', 'She/Her', 'They/Them']}
            />
          </div>

          <div class='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <SelectField
              label='Ethnicity'
              name='ethnicity'
              options={['Select Ethnicity']}
            />
            <SelectField
              label='First Language'
              name='language'
              options={['Select Language']}
            />
            <div>
              <InputField
                label='National ID'
                name='nationalId'
                placeholder='7973...'
              />
              <label class='flex items-center mt-2 text-sm text-gray-700'>
                <input
                  type='checkbox'
                  class='checkbox mr-2'
                  name='noNationalId'
                />
                Patient has no National ID
              </label>
            </div>
          </div>

          <div class='flex items-center gap-6 mt-6'>
            <img
              src='/default-avatar.png'
              alt='Patient Image'
              class='w-24 h-24 rounded-full border bg-white shadow-sm'
            />
            <div class='flex gap-4 p-4 border border-dashed border-gray-300 bg-gray-50 rounded-xl w-full max-w-md'>
              <button
                type='button'
                class='px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700 bg-white hover:bg-gray-100'
              >
                <span>🔄</span>
                <span class='font-medium'>Change Image</span>
              </button>
              <button
                type='button'
                class='px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-[#6366f1] bg-white hover:bg-[#f3f4f6]'
              >
                <span>📷</span>
                <span class='font-medium'>Take a picture</span>
              </button>
            </div>
          </div>

          <div class='flex justify-end gap-4 mt-6'>
            <button
              type='button'
              class='bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200'
            >
              Cancel
            </button>

            <button
              type='submit'
              class='bg-[#4f46e5] text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-700'
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    )
  },
)

// 共用元件：簡化文字輸入欄位
function InputField({ label, name, type = 'text', placeholder = '' }: {
  label: string
  name: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label class='block mb-1 font-medium'>{label}*</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        class='input input-bordered w-full'
      />
    </div>
  )
}

// 共用元件：簡化下拉選單欄位
function SelectField({ label, name, options = [] }: {
  label: string
  name: string
  options: string[]
}) {
  return (
    <div>
      <label class='block mb-1 font-medium'>{label}*</label>
      <select name={name} class='select select-bordered w-full'>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}
