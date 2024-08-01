import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'

// import {
//   CalendarDaysIcon,
//   CreditCardIcon,
//   UserCircleIcon,
// } from '../components/library/icons/heroicons/solid.tsx'
// import { Button } from '../components/library/Button.tsx'
import SideBySide from '../components/library/SideBySide.tsx'

// import { ArrowUpCircleIcon } from '../components/library/icons/heroicons/mini.tsx'
// import { ComponentChildren } from 'preact'
// import JobPost, { JobPostProps } from '../islands/JobPost.tsx'

// const jobs: JobPostProps[] = [
//   {
//     title: 'Lead UX Designer',
//     location: 'Remote',
//     summary: (
//       <>
//         As a Lead UX Designer, you will be responsible for overseeing the user
//         experience design process, from research and concept development to
//         wireframing and prototyping. You will collaborate with cross-functional
//         teams to create intuitive and user-centered designs for our products or
//         services. Your role will involve both hands-on design work and
//         leadership responsibilities.
//       </>
//     ),
//     fullDescription: (
//       <div>
//         Key Responsibilities:

//         User Research: Conduct user research to understand user needs,
//         behaviors, and pain points. Use this data to inform design decisions.

//         Information Architecture: Create information architecture, site maps,
//         and user flows to ensure an organized and logical structure for the
//         product.

//         Wireframing and Prototyping: Design wireframes, interactive prototypes,
//         and mockups to illustrate design concepts and workflows.

//         Usability Testing: Plan and conduct usability tests to gather feedback
//         and iterate on design solutions.

//         Team Collaboration: Work closely with product managers, developers, and
//         other stakeholders to ensure the alignment of design with business goals
//         and technical constraints.

//         Design Leadership: Mentor and provide guidance to junior designers. Lead
//         and inspire the design team to deliver high-quality work.

//         User-Centered Design: Advocate for a user-centered design approach
//         throughout the product development lifecycle.

//         UI Design: Collaborate with UI designers to create visually appealing
//         interfaces that align with the overall user experience.

//         Documentation: Create design documentation, style guides, and design
//         specifications for developers.

//         Stakeholder Communication: Effectively communicate design decisions and
//         rationale to stakeholders and ensure their buy-in.

//         Requirements:

//         <ol>
//           <li>
//             Education: Bachelor's or Master's degree in a relevant field such as
//             Human-Computer Interaction, UX Design, or Graphic Design.
//           </li>

//           <li>
//             Experience: Typically, 5+ years of experience in UX design, with a
//             proven track record of leading and delivering successful design
//             projects.
//           </li>

//           <li>
//             Portfolio: A strong portfolio that demonstrates your expertise in
//             user experience design, including examples of your work, process,
//             and the impact on the end user.
//           </li>

//           <li>
//             UX Design Tools: Proficiency in design and prototyping tools such as
//             Adobe XD, Sketch, Figma, or similar software.
//           </li>

//           <li>
//             User Research: Experience in conducting user research, usability
//             testing, and creating personas.
//           </li>

//           <li>
//             Problem-Solving Skills: Strong problem-solving and critical-thinking
//             abilities to address complex design challenges.
//           </li>

//           <li>
//             Communication Skills: Excellent communication and presentation
//             skills to convey design ideas and collaborate effectively with
//             cross-functional teams.
//           </li>

//           <li>
//             Leadership Skills: Proven leadership and mentoring capabilities to
//             guide and inspire junior designers.
//           </li>

//           <li>
//             Adaptability: Ability to adapt to changing project requirements and
//             priorities in a fast-paced environment.
//           </li>

//           <li>
//             Knowledge of Accessibility: Familiarity with web accessibility
//             standards (e.g., WCAG) and the ability to design with inclusivity in
//             mind.
//           </li>
//         </ol>

//         This job description and requirements may vary depending on the
//         organization, the specific industry, and the product or service being
//         developed. Still, it provides a general overview of the role of a Lead
//         UX Designer and what is typically expected from candidates applying for
//         this position.
//       </div>
//     ),
//   },
//   // {
//   //   title: 'Lead Software Engineer',
//   //   location: 'Remote',
//   // },
//   // {
//   //   title: 'Development Director',
//   //   location: 'Remote',
//   // },
//   // {
//   //   title: 'Virtual Hospital Director',
//   //   location: 'Remote',
//   // },
//   // {
//   //   title: 'Operations Lead',
//   //   location: '🇿🇼 Zimbabwe',
//   // },
// ]

export default function VolunteerPage(
  props: PageProps,
) {
  return (
    <Layout
      title='Volunteer Opportunities | Virtual Hospitals Africa'
      url={props.url}
      variant='just logo'
    >
      <SideBySide
        image='https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80'
        h1='Volunteer Opportunities'
      >
        <p className='mt-2 max-w-4xl text-sm text-gray-500'>
          Virtual Hospitals Africa is exicted to off
        </p>
        {/* {jobs.map((job) => <JobPost {...job} />)} */}
      </SideBySide>
    </Layout>
  )
}
