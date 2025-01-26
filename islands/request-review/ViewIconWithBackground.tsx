// deno-lint-ignore no-explicit-any
export default function ViewIconWithBackground(_props: any) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='203'
      height='206'
      fill='none'
      viewBox='0 0 203 206'
      className='absolute top-6 right-6'
    >
      <mask
        id='mask0_1625_12152'
        width='336'
        height='336'
        x='0'
        y='-130'
        maskUnits='userSpaceOnUse'
        style={{ maskType: 'alpha' }}
      >
        <path
          fill='url(#paint0_radial_1625_12152)'
          d='M0 0h336v336H0z'
          transform='translate(0 -130)'
        >
        </path>
      </mask>
      <g stroke='#E9EAEB' mask='url(#mask0_1625_12152)'>
        <circle cx='168' cy='38' r='47.5'></circle>
        <circle cx='168' cy='38' r='47.5'></circle>
        <circle cx='168' cy='38' r='71.5'></circle>
        <circle cx='168' cy='38' r='95.5'></circle>
        <circle cx='168' cy='38' r='119.5'></circle>
        <circle cx='168' cy='38' r='143.5'></circle>
        <circle cx='168' cy='38' r='167.5'></circle>
      </g>
      <g filter='url(#filter0_dii_1625_12152)'>
        <rect width='48' height='48' x='144' y='14' fill='#fff' rx='24'></rect>
        <rect
          width='47'
          height='47'
          x='144.5'
          y='14.5'
          stroke='#E9EAEB'
          rx='23.5'
        >
        </rect>
        <path
          stroke='#000'
          strokeLinejoin='round'
          strokeOpacity='0.65'
          strokeWidth='2'
          d='M168 44c5.523 0 10-6 10-6s-4.477-6-10-6-10 6-10 6 4.477 6 10 6Z'
        >
        </path>
        <path
          stroke='#000'
          strokeLinejoin='round'
          strokeOpacity='0.65'
          strokeWidth='2'
          d='M168 40.5a2.501 2.501 0 1 0 0-5.002 2.501 2.501 0 0 0 0 5.002Z'
        >
        </path>
      </g>
      <defs>
        <radialGradient
          id='paint0_radial_1625_12152'
          cx='0'
          cy='0'
          r='1'
          gradientTransform='rotate(90 0 168)scale(168)'
          gradientUnits='userSpaceOnUse'
        >
          <stop></stop>
          <stop offset='1' stopOpacity='0'></stop>
        </radialGradient>
        <filter
          id='filter0_dii_1625_12152'
          width='52'
          height='52'
          x='142'
          y='13'
          colorInterpolationFilters='sRGB'
          filterUnits='userSpaceOnUse'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix'></feFlood>
          <feColorMatrix
            in='SourceAlpha'
            result='hardAlpha'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          >
          </feColorMatrix>
          <feOffset dy='1'></feOffset>
          <feGaussianBlur stdDeviation='1'></feGaussianBlur>
          <feComposite in2='hardAlpha' operator='out'></feComposite>
          <feColorMatrix values='0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.05 0'>
          </feColorMatrix>
          <feBlend
            in2='BackgroundImageFix'
            result='effect1_dropShadow_1625_12152'
          >
          </feBlend>
          <feBlend
            in='SourceGraphic'
            in2='effect1_dropShadow_1625_12152'
            result='shape'
          >
          </feBlend>
          <feColorMatrix
            in='SourceAlpha'
            result='hardAlpha'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          >
          </feColorMatrix>
          <feOffset dy='-2'></feOffset>
          <feComposite
            in2='hardAlpha'
            k2='-1'
            k3='1'
            operator='arithmetic'
          >
          </feComposite>
          <feColorMatrix values='0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.05 0'>
          </feColorMatrix>
          <feBlend in2='shape' result='effect2_innerShadow_1625_12152'>
          </feBlend>
          <feColorMatrix
            in='SourceAlpha'
            result='hardAlpha'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          >
          </feColorMatrix>
          <feMorphology
            in='SourceAlpha'
            radius='1'
            result='effect3_innerShadow_1625_12152'
          >
          </feMorphology>
          <feOffset></feOffset>
          <feComposite
            in2='hardAlpha'
            k2='-1'
            k3='1'
            operator='arithmetic'
          >
          </feComposite>
          <feColorMatrix values='0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.18 0'>
          </feColorMatrix>
          <feBlend
            in2='effect2_innerShadow_1625_12152'
            result='effect3_innerShadow_1625_12152'
          >
          </feBlend>
        </filter>
      </defs>
    </svg>
  )
}
