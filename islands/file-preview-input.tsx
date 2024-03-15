import { useState } from 'preact/hooks'
import { ImageOrVideoInput, TextInputProps } from './form/Inputs.tsx'
import cls from '../util/cls.ts'
import { XMarkIcon } from '../components/library/icons/heroicons/outline.tsx'
import { Maybe } from '../types.ts'
import { assert } from 'std/assert/assert.ts'

type FilePreviewInputProps = Omit<TextInputProps, 'value'> & {
  className?: string
  fileName?: string
  value?: Maybe<{
    mime_type: string
    url: string
  }>
}

type ImagePreviewInputProps = Omit<FilePreviewInputProps, 'value'> & {
  value?: Maybe<string>
}

function mediaType(mime_type: string) {
  if (mime_type.startsWith('image/')) return 'image' as const
  if (mime_type.startsWith('video/')) return 'video' as const
  throw new Error(`Unknown media type: ${mime_type}`)
}

const twentyFourMb = 24 * 1024 * 1024

function Preview(
  { mime_type, url, name, className }: {
    mime_type: Maybe<string>
    url: Maybe<string>
    name: Maybe<string>
    className?: string
  },
) {
  if (!url) return null

  assert(mime_type)
  const media_type = mediaType(mime_type)

  return (
    <div className='flex items-center gap-3 flex-wrap'>
      <div
        className={cls(
          className,
          'mt-2 p-2 rounded-md border border-gray-300 border-solid',
        )}
      >
        {media_type === 'image' && (
          <img
            className='w-full h-full object-cover'
            src={url}
            alt={name ? `Uploaded ${name}` : ''}
          />
        )}
        {media_type === 'video' && (
          <video
            className='w-full h-full object-cover'
            src={url}
            alt={name ? `Uploaded ${name}` : ''}
            controls
          />
        )}
      </div>
      {name && <span className='text-gray-600'>{name}</span>}
    </div>
  )
}

export default function FilePreviewInput(
  { value, ...props }: FilePreviewInputProps,
) {
  const [initialImageRemoved, setInitialImageRemoved] = useState(false)
  const [image, setImage] = useState<
    null | {
      mime_type: string
      name: string
      url: string
    }
  >(null)
  const isShowPreview = image || (value && !initialImageRemoved)
  return (
    <>
      <ImageOrVideoInput
        value={initialImageRemoved ? null : value}
        {...props}
        onInput={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0] ?? null
          if (file == null) return setImage(null)
          if (file.size > twentyFourMb) {
            alert('File size must be less than 24MB')
            return setImage(null)
          }
          setImage({
            mime_type: file.type,
            name: file.name,
            url: URL.createObjectURL(file),
          })
        }}
      />
      {isShowPreview && (
        <Preview
          mime_type={image?.mime_type || value?.mime_type}
          url={image?.url || value?.url}
          name={image?.name || props.fileName}
          className={props.className}
        />
      )}
      {isShowPreview && (
        <XMarkIcon
          onClick={() => setInitialImageRemoved(true)}
        />
      )}
    </>
  )
}

export function ImagePreviewInput({ value, ...props }: ImagePreviewInputProps) {
  return (
    <FilePreviewInput
      {...props}
      value={value
        ? {
          mime_type: 'image/*',
          url: value,
        }
        : null}
    />
  )
}
