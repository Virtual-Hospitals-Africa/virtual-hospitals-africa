import { NearestHealthCareSection } from '../../islands/NearestHealthCare.tsx' // 最近醫療機構區塊
import { NextOfKinFormSection } from '../../islands/family/FamilyForm.tsx'      // 近親聯絡人區塊
import { PatientFamily, PatientIntake } from '../../types.ts'                   // 型別定義
import AddressSection from './AddressSection.tsx'                              // 地址區塊
//這邊把做好的PatientIntakeForm元件引入
import PersonalSection from './PersonalSection.tsx'                            // 病患個人資料區塊

// 病患資料填寫表單元件
export default function PatientIntakeForm(
  {
    patient,                  // 病患資料
    default_organization,     // 預設醫療機構
  }: {
    patient: Partial<PatientIntake> // 病患資料（部分欄位可選）
    previously_completed: boolean   // 是否已經填寫過
    default_organization?: { id: string; name: string; address: string } // 預設醫療機構
    family: Partial<PatientFamily>  // 家庭成員資料
  },
) {
  // 取得最近醫療機構資訊，優先用病患資料，否則用預設值
  const nearest_organization =
    patient.nearest_organization_id && patient.nearest_organization_name &&
      patient.nearest_organization_address
      ? {
        id: patient.nearest_organization_id,
        name: patient.nearest_organization_name,
        address: patient.nearest_organization_address,
      }
      : default_organization

  // 取得主治醫師資訊
  const primary_doctor =
    patient.primary_doctor_id && patient.primary_doctor_name
      ? {
        id: patient.primary_doctor_id,
        name: patient.primary_doctor_name,
      }
      : patient.unregistered_primary_doctor_name
      ? {
        name: patient.unregistered_primary_doctor_name,
        id: '',
      }
      : undefined

  // 回傳表單內容
  return (
    <>
      {/* 病患個人資料區塊 */}
      <PersonalSection
        patient={patient}
      />
      {/* 地址區塊 */}
      <AddressSection
        address={patient.address}
      />
      {/* 最近醫療機構與主治醫師區塊 */}
      <NearestHealthCareSection
        nearest_organization={nearest_organization}
        primary_doctor={primary_doctor}
      />
      {/* 近親聯絡人區塊 */}
      <NextOfKinFormSection />
    </>
  )
}
