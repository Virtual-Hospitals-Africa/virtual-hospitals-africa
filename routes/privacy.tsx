import { PageProps } from '$fresh/server.ts'
import Layout from '../components/library/Layout.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import SectionHeader from '../components/library/typography/SectionHeader.tsx'

export default function PartnerPage(
  props: PageProps,
) {
  return (
    <Layout
      title='Privacy Policy | Virtual Hospitals Africa'
      url={props.url}
      variant='just logo'
    >
      <section className='max-w-3xl p-6'>
        <PageHeader>Virtual Hospitals Africa Privacy Policy</PageHeader>
        <p className='mt-1.5'>
          <strong>Effective Date:</strong> 12 August 2024
        </p>

        <SectionHeader className='mt-4'>1. Introduction</SectionHeader>
        <p className='mt-1.5'>
          Welcome to Virtual Hospitals Africa. We are committed to protecting
          your personal information and your right to privacy. This Privacy
          Policy explains what information we collect, how we use and share it,
          and your rights regarding your personal data. By using our services,
          you agree to the collection and use of information in accordance with
          this policy. Our practices align with local regulatory standards to
          ensure the safe and ethical use of telemedicine.
        </p>

        <SectionHeader className='mt-4'>2. Our Services</SectionHeader>
        <p className='mt-1.5'>
          Virtual Hospitals Africa provides a comprehensive telemedicine
          platform designed to support healthcare professionals and patients
          through various tools and features:
        </p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Health Worker Application:</strong>{' '}
            This tool enables credentialed health workers to access patient
            data, conduct virtual consultations, and prescribe medications
            efficiently.
          </li>
          <li className='mt-0.5'>
            <strong>Regulator Application:</strong>{' '}
            This application offers authorized regulators the ability to oversee
            pharmacists, manage medication recalls, and ensure compliance with
            healthcare standards.
          </li>
          <li className='mt-0.5'>
            <strong>Pharmacist Chatbot:</strong>{' '}
            This feature allows credentialed pharmacists to access patient
            prescriptions, communicate directly with health workers, and
            streamline the prescription fulfillment process.
          </li>
        </ul>

        <SectionHeader className='mt-4'>
          3. Information We Collect
        </SectionHeader>
        <p className='mt-1.5'>
          We collect information about two distinct groups: patients (who do not
          use the application directly) and health workers, regulators, and
          pharmacists (who use the application).
        </p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Patient Information:</strong>{' '}
            We collect personal health information about patients from the
            health workers, regulators, and pharmacists using our platform. This
            includes the patient’s name, contact details, age, gender, medical
            history, and other relevant health information necessary for
            providing healthcare services.
          </li>
          <li className='mt-0.5'>
            <strong>
              Health Worker, Regulator, and Pharmacist Information:
            </strong>{' '}
            For users of the application, we collect personal information such
            as names, professional credentials, contact information, and usage
            data. This includes information about how our service is accessed
            and used, including device information, IP address, browser type,
            and browsing data.
          </li>
        </ul>

        <SectionHeader className='mt-4'>
          4. How We Use Your Information
        </SectionHeader>
        <p className='mt-1.5'>
          We use the collected information for various purposes:
        </p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>To provide and maintain our services:</strong>{' '}
            Including facilitating telehealth consultations, prescription
            services, and other medical support.
          </li>
          <li className='mt-0.5'>
            <strong>To improve our services:</strong>{' '}
            By analyzing usage data to enhance user experience and service
            delivery.
          </li>
          <li className='mt-0.5'>
            <strong>To communicate with you:</strong>{' '}
            Informing you of updates, changes to our service, and any pertinent
            health notifications.
          </li>
          <li className='mt-0.5'>
            <strong>To comply with legal obligations:</strong>{' '}
            Ensuring that all actions are in line with legal and regulatory
            requirements, promoting the ethical and secure handling of personal
            health information.
          </li>
        </ul>

        <SectionHeader className='mt-4'>5. Access and Security</SectionHeader>
        <p className='mt-1.5'>
          Access to our platform is by invitation only and restricted to
          credentialed health workers, regulators, and pharmacists. We are
          committed to ensuring that your information is secure. We implement
          various security measures to protect your personal information from
          unauthorized access or disclosure, ensuring the confidentiality and
          integrity of your data.
        </p>

        <SectionHeader className='mt-4'>
          6. Sharing Your Information
        </SectionHeader>
        <p className='mt-1.5'>
          We only share patient information with health professionals with the
          explicit consent of the patient. Health workers, regulators, and
          pharmacists’ information is not shared with third parties.
        </p>

        <SectionHeader className='mt-4'>7. Your Rights</SectionHeader>
        <p className='mt-1.5'>
          You have the following rights regarding your personal information:
        </p>
        <ul className='ml-2 mt-1'>
          <li className='mt-0.5'>
            <strong>Access:</strong>{' '}
            You can request access to your personal data and information on how
            it is used.
          </li>
          <li className='mt-0.5'>
            <strong>Correction:</strong>{' '}
            You can request corrections to any inaccurate or incomplete personal
            data.
          </li>
          <li className='mt-0.5'>
            <strong>Deletion:</strong>{' '}
            You can request the deletion of your personal data, subject to our
            legal obligations.
          </li>
        </ul>

        <SectionHeader className='mt-4'>
          8. Changes to This Privacy Policy
        </SectionHeader>
        <p className='mt-1.5'>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page. You are
          advised to review this Privacy Policy periodically for any changes.
        </p>

        <SectionHeader className='mt-4'>9. Contact Us</SectionHeader>
        <p className='mt-1.5'>
          If you have any questions about this Privacy Policy, please contact
          us: <a href='mailto:jtagarisa@gmail.com'>jtagarisa@gmail.com</a>
        </p>

        <p className='mt-2.5'>
          By using our services, you acknowledge that you have read and
          understood this Privacy Policy.
        </p>
      </section>
    </Layout>
  )
}
