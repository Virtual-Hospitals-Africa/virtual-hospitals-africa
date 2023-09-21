import {file} from '../../util/responses.ts'
type MediaItemProp = {
  binary_data: BinaryData,
  mime_type: string
}

export default function MediaItem({binary_data, mime_type}: MediaItemProp){
  return file(binary_data, mime_type)
}