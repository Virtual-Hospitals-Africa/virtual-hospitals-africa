import Menu from '../../islands/Menu.tsx'

export default function AppointmentMenu({ href }: { href: string }) {
  return (
    <Menu
      options={[
        { label: 'Cancel', href: `${href}/cancel` },
        { label: 'Reschedule', href: `${href}/reschedule` },
      ]}
    />
  )
}
