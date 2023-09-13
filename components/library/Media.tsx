export default function Media(
  { src, mime_type }: { src: string; mime_type: string },
) {
  const media_type = mime_type.toLowerCase()
  if (media_type.startsWith('image/')) {
    return <img src={src} />
  } else if (media_type.startsWith('video/')) {
    return <video controls src={src} />
  } else if (media_type.startsWith('audio/')) {
    return (
      <audio controls src={src}>
      </audio>
    )
  }
  return <p>Unspported Media Type: {mime_type}</p>
}
