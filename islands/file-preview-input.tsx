import { useState } from 'preact/hooks'
import {
  ImageInput,
  TextInputProps,
} from '../components/library/form/Inputs.tsx'
import cls from '../util/cls.ts'

type FilePreviewInputProps = TextInputProps & {
  classNames?: string
  fileName?: string
}

function PreviewImage(
  { image, name, classNames }: {
    image: string
    name: string
    classNames?: string
  },
) {
  return (
    <div className='flex items-center gap-3 flex-wrap'>
      <div
        className={cls(
          classNames,
          'mt-2 p-2 rounded-md border border-gray-300 border-solid',
        )}
      >
        <img
          className='w-full h-full object-cover'
          src={image}
          alt={`Uploaded ${name}`}
        />
      </div>
      <span className='text-gray-600'>{name}</span>
    </div>
  )
}

export default function FilePreviewInput(
  props: FilePreviewInputProps,
) {
  const [image, setImage] = useState<
    null | {
      name: string
      url: string
    }
  >(null)
  const isShowPreview = image || props.value
  return (
    <>
      <ImageInput
        {...props}
        onInput={(e) => {
          const files = (e.target as HTMLInputElement).files
          if (!files || files.length === 0) {
            setImage(null)
          } else {
            const imageURL = window.URL.createObjectURL(files[0])
            setImage({
              url: imageURL,
              name: files[0].name,
            })
          }
        }}
      />
      {isShowPreview && (
        <PreviewImage
          image={image?.url || props.value || ''}
          name={image?.name || props.fileName || ''}
          classNames={props.classNames}
        />
      )}
    </>
  )
}
