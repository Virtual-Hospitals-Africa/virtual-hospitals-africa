import { Container } from '../../components/library/Container.tsx'
import { UserCircleIcon } from '../../components/library/icons/heroicons/outline.tsx'
import { FeatureGrid } from './FeatureGrid.tsx'
import { SectionHeading } from './SectionHeading.tsx'

export function Patients() {
  return (
    <section
      id='patients'
      aria-labelledby='patients-title'
      className='scroll-mt-14 mt-12 sm:scroll-mt-32 sm:py-20 lg:py-32'
    >
      <Container>
        <SectionHeading id='patients-title' icon={<UserCircleIcon />}>
          Patients
        </SectionHeading>
        <p className='mt-8 font-display text-4xl font-bold tracking-tight text-slate-900'>
          24/7 medical professional services, in person and online
        </p>
        <p className='mt-4 text-lg tracking-tight text-slate-700'>
          Get peace of mind knowing you have instant access to your doctor’s
          office and global system of virtual hospitals anywhere you are.
        </p>
      </Container>
      <FeatureGrid
        features={[
          {
            title: 'Talk with a professional',
            description:
              'Speak with your doctor’s office from your mobile device or get immediate answers from our worldwide network of health professionals.',
            image: '/images/demos/talk_with_professional.png',
          },
          {
            title: 'Check your health status',
            description:
              'With our WhatsApp chatbot, patients have instant access to their medical records, specialist reports, and lab results.',
            image: '/images/demos/health_status.png',
          },
          {
            title: 'Fill prescriptions automatically',
            description:
              'New medications can be sent to your preferred pharmacist. Refill prescriptions with one click from your mobile device.',
            image: '/images/demos/automatic_prescriptions.png',
          },
          {
            title: 'Follow health plan',
            description:
              'Receive regular reminders to stay on top of your health and fitness.',
            image: '/images/demos/health_plan.png',
          },
        ]}
      />
    </section>
  )
}
