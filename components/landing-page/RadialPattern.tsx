export default function RadialPattern() {
  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 h-full w-full'
      style={{
        background:
          'radial-gradient(circle at 100% 0%, rgba(255, 234, 202, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
      }}
    />
  )
}
