import { JSX } from 'preact'
import cls from '../util/cls.ts'
import { Timer } from '../islands/timer.tsx'

function Band1() {
  return (
    <svg
      className='absolute band1'
      width='178'
      height='121'
      viewBox='0 0 178 121'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M106.665 110.076C95.336 120.661 96.5415 120.661 87.5474 120.661C78.5534 120.661 79.0215 117.165 71.2622 110.076C62.7656 102.315 62.7656 102.315 62.7656 98.7864C65.7426 94.9249 73.3864 88.2021 87.5474 88.2021C103.125 88.2021 110.768 94.9249 113.745 98.7864C115.855 101.523 113.745 103.461 106.665 110.076Z'
        fill='white'
      />
    </svg>
  )
}

function Band2() {
  return (
    <svg
      className='absolute band2'
      width='178'
      height='121'
      viewBox='0 0 178 121'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M88.388 65.6462C75.6209 65.6461 62.7668 70.5625 53.9452 76.3649C50.9728 78.32 42.6994 82.6331 38.209 76.8884C33.7185 71.1436 27.6708 67.0925 33.4354 62.6174C42.1695 55.8371 60.0257 44.9203 88.3881 44.9204C104.839 44.9205 116.858 47.8848 126.23 52.084C135.175 56.0917 140.307 60.0013 143.449 62.1526C149.471 66.2769 144.193 70.5625 138.362 76.2534C134.224 82.2549 126.23 78.211 124.213 76.8298C113.607 69.5664 101.155 65.6462 88.388 65.6462Z'
        fill='white'
      />
    </svg>
  )
}

function Band3() {
  return (
    <svg
      className='absolute band3'
      width='178'
      height='121'
      viewBox='0 0 178 121'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M87.5532 25.9255C49.0253 25.9254 34.444 40.2203 22.6315 46.0106C17.0571 48.7431 11.3204 49.4932 6.82988 43.7484C2.33939 38.0037 -1.66668 35.281 0.705563 30.8519C3.0778 26.4228 40.5631 -0.000118759 87.5532 4.00328e-10C115.405 6.9859e-05 135.254 5.55743 150.418 12.3516C164.064 18.4654 173.93 25.7172 176.763 30.8519C179.595 35.9866 175.346 37.3978 169.682 43.7116C164.018 50.0254 156.229 45.8653 154.695 44.1179C138.528 32.2631 112.312 25.9256 87.5532 25.9255Z'
        fill='white'
      />
    </svg>
  )
}

export default function LoadingTest() {
  return (
    <>
      <div
        className='foob'
        style={{
          width: 178 + (20 * 2),
          height: 121 + (20 * 2),
          padding: 20,
          backgroundColor: '#312E81',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Band1 />
        <Band2 />
        <Band3 />
        {
          /* <svg
          viewBox='0 0 400 400'
          className='absolute h-full w-full top-0 left-0 wifi-heart-final-circle'
        >
          <circle
            cx='200'
            cy='200'
            r='190'
            fill='none'
            stroke='#fff'
            strokeWidth='20'
          />
        </svg> */
        }
        {/* <span className='wifi-heart-final-circle absolute inline-flex h-2/3 w-2/3 top-1/6 left-1/6 rounded-full bg-white' /> */}
      </div>
      <Timer />
    </>
  )
}
