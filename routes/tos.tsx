import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import SectionHeader from '../components/library/typography/SectionHeader.tsx'

export default function TermsOfServicePage(
  props: PageProps,
) {
  return (
    <Layout
      title='Terms Of Service | Virtual Hospitals Africa'
      url={props.url}
      variant='just logo'
    >
      <section className='max-w-3xl p-6'>
        <PageHeader>Virtual Hospitals Africa Terms Of Service</PageHeader>
        <p className='mt-1.5'>
          <strong>Effective Date:</strong> 12 August 2024
        </p>

        <SectionHeader className='mt-4'>1. Introduction</SectionHeader>
        <p className='mt-1.5'>
          Welcome to Virtual Hospitals Africa. These Terms of Service (“Terms”)
          govern your use of our telemedicine platform and services. By
          accessing or using our services, you agree to be bound by these Terms.
          If you do not agree to these Terms, please do not use our services.
        </p>

        <SectionHeader className='mt-4'>2. Services Provided</SectionHeader>
        <p className='mt-1.5'>
          Virtual Hospitals Africa offers a telemedicine platform that includes:
        </p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Health Worker Application:</strong>{' '}
            A tool for credentialed health workers to access patient data,
            conduct virtual consultations, and manage prescriptions.
          </li>
          <li className='mt-0.5'>
            <strong>Regulator Application:</strong>{' '}
            A tool for authorized regulators to oversee pharmacists, manage
            medication recalls, and ensure healthcare compliance.
          </li>
          <li className='mt-0.5'>
            <strong>Pharmacist Chatbot:</strong>{' '}
            A feature allowing credentialed pharmacists to access patient
            prescriptions and communicate with health workers.
          </li>
        </ul>

        <SectionHeader className='mt-4'>3. User Eligibility</SectionHeader>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Health Workers:</strong>{' '}
            Must be credentialed and authorized to use the Health Worker
            Application.
          </li>
          <li className='mt-0.5'>
            <strong>Regulators:</strong>{' '}
            Must be authorized to use the Regulator Application.
          </li>
          <li className='mt-0.5'>
            <strong>Pharmacists:</strong>{' '}
            Must be credentialed to use the Pharmacist Chatbot.
          </li>
        </ul>
        <p className='mt-1.5'>
          Access to our platform is by invitation only, and users must meet the
          necessary professional qualifications.
        </p>

        <SectionHeader className='mt-4'>4. User Responsibilities</SectionHeader>
        <p className='mt-1.5'>By using our services, you agree to:</p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Provide Accurate Information:</strong>{' '}
            Ensure that all information provided to Virtual Hospitals Africa is
            accurate and up-to-date.
          </li>
          <li className='mt-0.5'>
            <strong>Maintain Confidentiality:</strong>{' '}
            Protect your login credentials and maintain the confidentiality of
            patient and professional information.
          </li>
          <li className='mt-0.5'>
            <strong>Compliance:</strong>{' '}
            Adhere to all applicable laws and regulations while using our
            services.
          </li>
        </ul>

        <SectionHeader className='mt-4'>
          5. Data Privacy and Security
        </SectionHeader>
        <p className='mt-1.5'>
          We are committed to protecting your personal information. Please refer
          to our <a href='#'>Privacy Policy</a>{' '}
          for details on how we collect, use, and protect your data.
        </p>

        <SectionHeader className='mt-4'>6. Prohibited Activities</SectionHeader>
        <p className='mt-1.5'>You agree not to:</p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Misuse the Platform:</strong>{' '}
            Use the platform for any unlawful or unauthorized purposes.
          </li>
          <li className='mt-0.5'>
            <strong>Share Access:</strong>{' '}
            Share your login credentials with unauthorized individuals.
          </li>
          <li className='mt-0.5'>
            <strong>Infringe Rights:</strong>{' '}
            Violate any intellectual property rights or privacy rights of
            others.
          </li>
        </ul>

        <SectionHeader className='mt-4'>7. Intellectual Property</SectionHeader>
        <p className='mt-1.5'>
          All content and materials provided through our platform are the
          property of Virtual Hospitals Africa or its licensors. You may not
          copy, modify, distribute, or create derivative works based on our
          content without our prior written consent.
        </p>

        <SectionHeader className='mt-4'>8. Termination</SectionHeader>
        <p className='mt-1.5'>
          We reserve the right to suspend or terminate your access to our
          services at any time, with or without cause, if we believe you have
          violated these Terms or engaged in inappropriate behavior.
        </p>

        <SectionHeader className='mt-4'>
          9. Limitation of Liability
        </SectionHeader>
        <p className='mt-1.5'>
          Virtual Hospitals Africa is not liable for any indirect, incidental,
          special, or consequential damages arising from your use of our
          services. Our liability is limited to the maximum extent permitted by
          law.
        </p>

        <SectionHeader className='mt-4'>10. Changes to Terms</SectionHeader>
        <p className='mt-1.5'>
          We may update these Terms from time to time. We will notify you of any
          changes by posting the new Terms on our website. Your continued use of
          our services after such changes constitutes your acceptance of the
          updated Terms.
        </p>

        <SectionHeader className='mt-4'>11. Governing Law</SectionHeader>
        <p className='mt-1.5'>
          These Terms are governed by and construed in accordance with the laws
          of the country of operation.
        </p>

        <SectionHeader className='mt-4'>12. Contact Us</SectionHeader>
        <p className='mt-1.5'>
          If you have any questions about this Privacy Policy, please contact
          us: <a href='mailto:jtagarisa@gmail.com'>jtagarisa@gmail.com</a>
        </p>

        <p className='mt-1.5'>
          By using our services, you acknowledge that you have read, understood,
          and agreed to these Terms of Service.
        </p>
      </section>
    </Layout>
  )
}
