import { Container } from '../../components/library/Container.tsx'
import { UserCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { FeatureGrid } from './FeatureGrid.tsx'
import { SectionHeading } from './SectionHeading.tsx'

export function Patients() {
  return (
    <section
      id='patients'
      aria-labelledby='patients-title'
      className='scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32'
    >
      <Container>
        <SectionHeading id='patients-title' icon={<UserCircleIcon />}>
          Patients
        </SectionHeading>
        <p className='mt-8 font-display text-4xl font-bold tracking-tight text-slate-900'>
          Over an hour of high quality, step-by-step video content to sharpen
          your icon design workflow.
        </p>
        <p className='mt-4 text-lg tracking-tight text-slate-700'>
          Learn how to design your very first icons in a series of patients that
          will teach you everything you need to know to go from beginner to pro
          in just over an hour.
        </p>
      </Container>
      <FeatureGrid
        features={[
          {
            title: 'Task with a professional',
            description:
              'Speak with your doctor’s office from your mobile device or get immediate answers from our worldwide network of health professionals.',
            image: '/images/screencasts/setup.svg',
          },
          {
            title: 'Check your health status',
            description:
              'With our WhatsApp chatbot, patients have instant access to their medical records, specialist reports, and lab results.',
            image: '/images/screencasts/grids.svg',
          },
          {
            title: 'Fill prescriptions automatically',
            description:
              'New medications can be sent to your preferred pharmacist. Refill prescriptions with one click from your mobile device.',
            image: '/images/screencasts/strokes.svg',
          },
          {
            title: 'Follow health plan',
            description:
              'Receive regular reminders to stay on top of your health and fitness.',
            image: '/images/screencasts/duotone.svg',
          },
        ]}
      />
    </section>
  )
}
