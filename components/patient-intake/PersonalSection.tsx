import {
  DateInput,
  EthnicitySelect,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../../islands/form/Inputs.tsx'
import FormRow from '../library/FormRow.tsx'
import { PatientIntake } from '../../types.ts'
import { NationalIdFormGroup } from '../../islands/NationalId.tsx'
import FormSection from '../library/FormSection.tsx'

export default function PatientSection(
  { patient = {} }: { patient?: Partial<PatientIntake> },
) {
  const names = patient.name ? patient.name.split(/\s+/) : []

  // 简单的内联函数，直接在HTML中
  const handleChangePhotoClick = () => {
    console.log('Change Photo button clicked!')
    const input = document.getElementById('photo-input') as HTMLInputElement
    if (input) {
      input.click()
    } else {
      console.error('Photo input not found')
    }
  }

  const handleTakePhotoClick = () => {
    console.log('Take Photo button clicked!')
    alert('Take Photo功能被点击了！')
    // 简单的摄像头测试
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          console.log('摄像头权限获取成功')
          alert('摄像头权限获取成功！')
          // 停止流
          stream.getTracks().forEach((track) => track.stop())
        })
        .catch((error) => {
          console.error('摄像头权限获取失败:', error)
          alert('摄像头权限获取失败: ' + error.name)
        })
    } else {
      alert('浏览器不支持摄像头功能')
    }
  }

  const handleFileChange = (event: any) => {
    console.log('File input changed!')
    const file = event.target.files[0]
    if (file) {
      console.log('File selected:', file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.getElementById('profile-image') as HTMLImageElement
        const placeholder = document.getElementById('profile-placeholder')
        if (img && e.target && placeholder) {
          img.src = e.target.result as string
          img.style.display = 'block'
          placeholder.style.display = 'none'
          console.log('Image loaded and displayed')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <style>
        {`
          .modern-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .modern-section {
            padding: 2rem;
          }
          
          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1.5rem;
          }
          
          .three-col-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .profile-section {
            border-top: 1px solid #e5e7eb;
            padding-top: 2rem;
            margin-top: 2rem;
          }
          
          .profile-flex {
            display: flex;
            align-items: center;
            gap: 2rem;
          }
          
          .profile-pic {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
            border: 2px solid #e5e7eb;
            position: relative;
          }

          .profile-pic img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
          }
          
          .profile-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }
          
          .test-btn {
            display: inline-flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            border: 2px solid;
            background: none;
          }
          
          .test-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .btn-secondary {
            background: white;
            color: #374151;
            border-color: #d1d5db;
          }

          .btn-secondary:hover {
            background: #f9fafb;
            border-color: #9ca3af;
          }
          
          .btn-primary {
            background: #4f46e5;
            color: white;
            border-color: #4f46e5;
          }

          .btn-primary:hover {
            background: #4338ca;
          }

          .custom-select {
            display: block;
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.875rem;
            background: white;
            color: #1f2937;
          }

          .custom-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.25rem;
          }

          .hidden {
            display: none !important;
          }
          
          @media (max-width: 768px) {
            .three-col-grid {
              grid-template-columns: 1fr;
            }
            .profile-flex {
              flex-direction: column;
              text-align: center;
            }
          }
        `}
      </style>

      <div className='modern-container'>
        <div className='modern-section'>
          <h2 className='section-title'>General</h2>

          {/* 第一行：姓名字段 */}
          <div className='three-col-grid'>
            <TextInput
              name='first_name'
              value={names[0]}
              required
              label='Name'
            />
            <TextInput
              name='middle_names'
              value={names.slice(1, -1).join(' ')}
              label='Middle Name'
            />
            <TextInput
              name='last_name'
              value={names.slice(-1)[0]}
              required
              label='Surname'
            />
          </div>

          {/* 第二行：日期、性别字段 */}
          <div className='three-col-grid'>
            <DateInput
              name='date_of_birth'
              value={patient.date_of_birth}
              required
              label='Date of Birth'
            />
            <GenderSelect value={patient.gender} />
            <div>
              <label className='custom-label'>
                Gender *
              </label>
              <select
                name='gender_identity'
                required
                className='custom-select'
              >
                <option value=''>Select</option>
                <option value='he/him'>He/Him</option>
                <option value='she/her'>She/Her</option>
                <option value='they/them'>They/Them</option>
              </select>
            </div>
          </div>

          {/* 第三行：民族、语言、身份证 */}
          <div className='three-col-grid'>
            <EthnicitySelect value={patient.ethnicity} />
            <div>
              <label className='custom-label'>
                First Language *
              </label>
              <select
                name='first_language'
                required
                className='custom-select'
              >
                <option value=''>Select Language</option>
                <option value='english'>English</option>
                <option value='shona'>Shona</option>
                <option value='ndebele'>Ndebele</option>
              </select>
            </div>
            <NationalIdFormGroup
              national_id_number={patient.national_id_number}
            />
          </div>

          {/* Profile Picture 部分 */}
          <div className='profile-section'>
            <h3 className='section-title'>Profile Picture</h3>
            <div className='profile-flex'>
              <div className='profile-pic'>
                <img
                  id='profile-image'
                  style={{ display: 'none' }}
                  alt='Profile'
                />
                <span
                  id='profile-placeholder'
                  style={{ fontSize: '2.5rem', color: '#9ca3af' }}
                >
                  👤
                </span>
              </div>
              <div className='profile-buttons'>
                <button
                  type='button'
                  className='test-btn btn-secondary'
                  onClick={handleChangePhotoClick}
                >
                  🔄 Change Photo
                </button>
                <button
                  type='button'
                  className='test-btn btn-primary'
                  onClick={handleTakePhotoClick}
                >
                  📷 Take a picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 文件输入 */}
      <input
        id='photo-input'
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
