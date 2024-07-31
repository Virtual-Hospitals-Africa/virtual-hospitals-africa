export default function MedicalIconPattern() {
  return (
    <div
      aria-hidden='true'
      className='h-48 md:absolute md:inset-0 md:h-full w-full'
      style={{
        opacity: 0.35,
        backgroundImage: 'url("/images/medical-icon-background.png")',
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
      }}
    />
  )
}
