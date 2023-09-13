export default function Media(
  { src, mime_type }: { src: string; mime_type: string },
) {
  const media_type = mime_type.toLowerCase()
  const element = media_type.startsWith('image/')
    ? (
      <img
        src={src}
        alt='alt'
      />
    )
    : <video src={src}></video>
  return element
}
