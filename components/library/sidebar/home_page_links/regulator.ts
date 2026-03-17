import { LinkDef } from '../../../../types.ts'
import { ArrowRightOnRectangleIcon, UsersIcon } from '../../icons/heroicons/mini.tsx'
import { MedicineIcon } from '../../icons/Medicines.tsx'
import { PharmaciesIcon } from '../../icons/Pharmacies.tsx'

export const regulator_home_page_nav_links: LinkDef[] = [
  {
    route: '/regulator/:country/pharmacists',
    title: 'Pharmacists',
    Icon: UsersIcon,
  },
  {
    route: '/regulator/:country/pharmacies',
    title: 'Pharmacies',
    Icon: PharmaciesIcon,
  },
  {
    route: '/regulator/:country/medications',
    title: 'Medicines',
    Icon: MedicineIcon,
  },
  {
    route: '/regulator/logout',
    title: 'Log Out',
    Icon: ArrowRightOnRectangleIcon,
  },
]
