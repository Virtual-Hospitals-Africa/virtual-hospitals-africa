import {
  DateInput,         // 日期輸入元件
  EthnicitySelect,   // 種族選擇元件
  GenderSelect,      // 性別選擇元件
  PhoneNumberInput,  // 電話號碼輸入元件
  TextInput,         // 文字輸入元件
  NationalitySelect, // 國籍選擇元件,但value未使用
} from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx' // 表單列元件
import { PatientIntake } from '../../types.ts' // 病患資料型別
import { NationalIdFormGroup } from '../../islands/NationalId.tsx' // 國民身分證元件
import FormSection from '../library/FormSection.tsx' // 表單區塊元件

// 病患資料區塊元件
export default function PatientSection(
  { patient = {} }: {
    patient?: Partial<PatientIntake> // 可選的病患資料
  },
) {
  // 將姓名依空白分割成陣列
  const names = patient.name ? patient.name.split(/\s+/) : []

  //渲染出來的東西
  return (
    <>
      {/* 病患資訊表單區塊 */}
      <FormSection header='Patient Information'>
        {/* 第一列：姓名欄位 */}
        <FormRow>
          <TextInput
            name='first_name'
            value={names[0]} // 名字
            required
          />
          <TextInput
            name='middle_names'
            value={names.slice(1, -1).join(' ')} // 中間名
          />
          <TextInput
            name='last_name'
            value={names.slice(-1)[0]} // 姓氏
            required
          />
        </FormRow>
        {/* 第二列：性別、生日、種族、電話 */}
        <FormRow>
          <GenderSelect value={patient.gender} /> {/* 性別 */}
          <DateInput
            name='date_of_birth'
            value={patient.date_of_birth} // 生日
            required
          />
          <EthnicitySelect value={patient.ethnicity} /> {/* 種族 */}
          <PhoneNumberInput
            name='phone_number'
            value={patient.phone_number} // 電話
          />
        </FormRow>
        {/* 國民身分證欄位 */}
        <NationalIdFormGroup
          national_id_number={patient.national_id_number}
        />
        <NationalitySelect value={patient.nationality}/>
      </FormSection>
    </>
  )
}
