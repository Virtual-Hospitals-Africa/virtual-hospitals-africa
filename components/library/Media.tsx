export default function Media(
  { src, mime_type }: { src: string; mime_type: string },
) {
  const media_type = mime_type.toLowerCase()
  const element = media_type.includes('jpeg')
    ? (
      <img
        src={src}
        alt=''
      />
    )
    : <video src={src}></video>
  return element
}
