import DoctorImage from './DoctorImage.tsx'
import cls from '../../util/cls.ts'

export default function DemoVideoContainer(
  { className }: { className?: string },
) {
  return (
    <div
      className={cls(
        'relative z-10 mx-6 rounded-xl bg-slate-600 shadow-xl md:w-80 lg:w-auto',
        className,
      )}
    >
      <DoctorImage />
      <a
        className='absolute w-full h-full grid place-items-center'
        role='button'
        href='#demo'
      >
        <svg
          width='121'
          height='120'
          viewBox='0 0 121 120'
          fill='none'
          className='group hover:fill-red-500 transition-all duration-300'
        >
          <path
            className='group-hover:fill-red-500'
            fill-rule='evenodd'
            clip-rule='evenodd'
            d='M60.71 108C73.4404 108 85.6493 102.943 94.6511 93.9411C103.653 84.9394 108.71 72.7304 108.71 60C108.71 47.2696 103.653 35.0606 94.6511 26.0589C85.6493 17.0571 73.4404 12 60.71 12C47.9796 12 35.7706 17.0571 26.7688 26.0589C17.7671 35.0606 12.71 47.2696 12.71 60C12.71 72.7304 17.7671 84.9394 26.7688 93.9411C35.7706 102.943 47.9796 108 60.71 108ZM58.04 43.008C57.1364 42.4051 56.086 42.0589 55.0011 42.0062C53.9161 41.9535 52.8371 42.1963 51.8794 42.7088C50.9216 43.2212 50.1209 43.9841 49.5627 44.9159C49.0045 45.8478 48.7098 46.9137 48.71 48V72C48.7098 73.0863 49.0045 74.1522 49.5627 75.0841C50.1209 76.0159 50.9216 76.7788 51.8794 77.2912C52.8371 77.8037 53.9161 78.0465 55.0011 77.9938C56.086 77.9411 57.1364 77.5949 58.04 76.992L76.04 64.992C76.8617 64.4441 77.5355 63.7017 78.0015 62.8309C78.4675 61.9601 78.7113 60.9877 78.7113 60C78.7113 59.0123 78.4675 58.0399 78.0015 57.1691C77.5355 56.2983 76.8617 55.5559 76.04 55.008L58.04 43.008Z'
            fill='#2563EB'
          />
        </svg>
      </a>
    </div>
  )
}
