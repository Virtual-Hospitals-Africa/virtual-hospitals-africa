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

          <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <InputField label='Date of Birth' name='dob' type='date' />
            <InputField
              label='National ID'
              name='nationalId'
              placeholder='7973...'
            />
          </div>

          <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <SelectField label='Sex' name='sex' options={['Male', 'Female']} />
            <SelectField
              label='Gender'
              name='gender'
              options={['He/Him', 'She/Her', 'They/Them']}
            />
          </div>

          <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
          </div>

          <div class='flex items-center gap-4 mt-4'>
            <img
              src='/default-avatar.png'
              alt='Patient Image'
              class='w-24 h-24 rounded-full'
            />
            <button type='button' class='btn btn-outline'>Change Image</button>
            <button type='button' class='btn btn-outline'>
              Take a picture
            </button>
          </div>

          <div class='flex justify-end gap-4 mt-6'>
            <button type='button' class='btn btn-outline'>Cancel</button>
            <button type='submit' class='btn btn-primary'>Save Changes</button>
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
        {options.map((opt) => <option value={opt}>{opt}</option>)}
      </select>
    </div>
  )
}
