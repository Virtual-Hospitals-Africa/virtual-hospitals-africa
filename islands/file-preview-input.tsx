import { useState } from 'preact/hooks'
import { ImageOrVideoInput, TextInputProps } from './form/Inputs.tsx'
import cls from '../util/cls.ts'
import { Maybe } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import { RemoveRow } from './AddRemove.tsx'
import { Label } from '../components/library/Label.tsx'

type FilePreviewInputProps = Omit<TextInputProps, 'value' | 'label'> & {
  label?: string
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

export default function Preview(
  { mime_type, url, name, className, remove }: {
    mime_type: Maybe<string>
    url: Maybe<string>
    name: Maybe<string>
    className?: string
    remove(): void
  },
) {
  if (!url) return null

  assert(mime_type)
  const media_type = mediaType(mime_type)

  return (
    <div className='flex flex-col gap-0.5 flex-wrap'>
      <RemoveRow
        onClick={() => {
          remove()
        }}
        centered
      >
        <div
          className={cls(
            'mt-2 p-2 rounded-md border border-gray-300 border-solid relative',
            className,
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
              aria-label={name ? `Uploaded ${name}` : ''}
              controls
            />
          )}
        </div>
      </RemoveRow>
    </div>
  )
}

export function FilePreviewInput(
  { value, label, ...props }: FilePreviewInputProps,
) {
  const [initialImageRemoved, setInitialImageRemoved] = useState(false)
  const [image, setImage] = useState<
    null | {
      mime_type: string
      url: string
      name: string
      file?: File
    }
  >(
    value
      ? {
        mime_type: value.mime_type,
        url: value.url,
        name: props.fileName || '',
      }
      : null,
  )
  const isShowPreview = image?.url || (value?.url && !initialImageRemoved)

  const input = (
    <ImageOrVideoInput
      value={initialImageRemoved ? null : value}
      label={isShowPreview ? '' : label}
      {...props}
      onInput={(e) => {
        const file = e.currentTarget.files?.[0]
        if (file == null) return setImage(null)
        if (file.size > twentyFourMb) {
          alert('File size must be less than 24MB')
          return setImage(null)
        }
        setImage({
          mime_type: file.type,
          name: file.name,
          url: URL.createObjectURL(file),
          file,
        })
        setInitialImageRemoved(true)
      }}
    />
  )

  if (isShowPreview) {
    return (
      <Label label={label} className='relative'>
        {input}
        <Preview
          name={image?.name || ''}
          mime_type={image?.mime_type || value?.mime_type}
          url={image?.url || value?.url}
          className={props.className}
          remove={() => {
            setImage(null)
            setInitialImageRemoved(true)
          }}
        />
      </Label>
    )
  }

  return input
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
