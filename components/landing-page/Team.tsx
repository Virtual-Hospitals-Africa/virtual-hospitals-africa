import { Button } from '../../components/library/Button.tsx'
import { Container } from '../../components/library/Container.tsx'
import { UsersIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { SectionHeading } from './SectionHeading.tsx'

const people = [
  {
    name: 'Jonathan Tagarisa',
    role: 'Chief Executive Officer',
    imageUrl: '/images/team/jonathan.jpeg',
    bio:
      'Jonathan is the founding trustee of Health Gateway Africa Trust  seasoned IT professional with over 20 years in Systems Analysis and Networking Technologies. He has a proven track record of success in leading and managing complex projects as well as a deep understanding of the latest technologies and trends. Passionate advocate for social impact, Jonathan is a board member of several non-profit organizations.',
    linkedinUrl: 'https://linkedin.com/in/jonathan-tagarisa-07333710',
  },
  {
    name: 'Will Weiss',
    role: 'Chief Technology Officer',
    imageUrl: '/images/team/will_2.png',
    bio:
      'Will Weiss is a passionate technologist and humanitarian who las led engineering and nonprofit teams in a variety of international settings create systems that scale and improve lives.<br><br>Founder at More Human Internet, Will works extensively with volunteers contributing their expertise to maximize the impact of international causes.',
    linkedinUrl: 'https://linkedin.com/in/willweiss1',
  },
  {
    name: 'Dr. Sikhululiwe Ngwenya',
    role: 'Chief Medical Officer',
    imageUrl: '/images/team/skhu.jpeg',
    bio:
      'Sikhululiwe Ngwenya is a medical doctor and digital health leader with a passion for using technology to improve the quality, accessibility, and affordability of healthcare. She has a strong track record in the health care sector with experience in clinical care, research and health promotion. Dr. Sikhululiwe is passionate about using technology to solve real-world healthcare challenges and improve the lives of patients.',
    linkedinUrl: 'https://linkedin.com/in/sikhululiwe-ngwenya-27ab9053',
  },
]

export function Team() {
  return (
    <div className='bg-white pt-8 pb-24 md:pb-32'>
      <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
        About the team
      </h2>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-6 xl:grid-cols-2 mt-4'>
        <div className='max-w-2xl xl:col-span-1'>
          <p className='text-lg leading-8 text-gray-600'>
            Our team believes that the global health space is in need of
            creative vigor to bring new possibilities forward, advancing how
            care is delivered.
          </p>
        </div>
        <div className='max-w-2xl xl:col-span-1'>
          <p className='text-lg leading-8 text-gray-600'>
            We bring 45 years of combined experience in bringing technology
            solutions into resource poor settings, challenging deeply held
            assumptions about what is possible.
          </p>
        </div>
      </div>
      <Button
        className='mt-6'
        href='/volunteer'
        variant='solid'
        color='indigo'
      >
        Volunteer Opportunities
      </Button>
      <ul
        role='list'
        className='mt-6 space-y-12 divide-y divide-gray-200 xl:col-span-3'
      >
        {people.map((person) => (
          <li
            key={person.name}
            className='flex flex-col gap-10 pt-12 sm:flex-row'
          >
            <img
              className='aspect-[4/5] w-52 flex-none rounded-2xl object-cover'
              src={person.imageUrl}
              alt=''
            />
            <div className='max-w-xl flex-auto'>
              <h3 className='text-lg font-semibold leading-8 tracking-tight text-gray-900'>
                {person.name}
              </h3>
              <p className='text-base leading-7 text-gray-600'>
                {person.role}
              </p>
              <p
                className='mt-6 text-base leading-7 text-gray-600'
                dangerouslySetInnerHTML={{ __html: person.bio }}
              />
              <ul role='list' className='mt-6 flex gap-x-6'>
                <li>
                  <a
                    href={person.linkedinUrl}
                    className='text-gray-400 hover:text-gray-500'
                  >
                    <span className='sr-only'>LinkedIn</span>
                    <svg
                      className='h-5 w-5'
                      aria-hidden='true'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TeamSection() {
  return (
    <section
      id='team'
      aria-labelledby='team-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-8 lg:py-12'
    >
      <Container>
        <SectionHeading id='team-title' icon={<UsersIcon />}>
          Team
        </SectionHeading>
        <Team />
      </Container>
    </section>
  )
}
