import { useState } from 'preact/hooks';
import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'

export default function InviteEmployees(props: PageProps) {
  const [emails, setEmails] = useState(['', '', '']);
  const [professions, setProfessions] = useState(['', '', '']);

  const handleInputChange = (index: number, values: string[], setter: (value: string[]) => void) => (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValues = [...values];
    newValues[index] = target.value;
    setter(newValues);
  
    // Use newValues for checking all inputs are filled
    const allInputsFilled = newValues.every(value => value !== '');
  
    // If all boxes are filled and we are editing the last box, add a new box
    if (allInputsFilled && index === newValues.length - 1) {
      if (setter === setEmails) {
        setEmails([...newValues, '']);
      }
      if (setter === setProfessions) {
        setProfessions([...newValues, '']);
      }
    }
  }


  return (
    <Layout
    title='Invite Employees'
    route={props.route}
    avatarUrl={props.data.healthWorker.avatar_url}
    variant='standard'
  >
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'white', backgroundColor: 'rgb(79, 70, 229)', padding: '10px', fontSize: '1.5em' }} className="font-semibold">Invite Employees</h1>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '0 20px' }}>
        <div style={{ width: '45%' }} className="mt-4">
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-500">
            Email<span style={{color: 'gray'}}>*</span>
          </label>
          {emails.map((email, index) => (
            <div key={index} className="mt-2 mb-2">
              <input
                type="email"
                name={`email-${index}`}
                id={`email-${index}`}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
                value={email}
                onChange={handleInputChange(index, emails, setEmails)}
                style={{ height: '35px', paddingLeft: '10px', paddingRight: '10px' }}  // Add left and right padding
              />
            </div>
          ))}
        </div>
        <div style={{ width: '45%' }} className="mt-4">
          <label htmlFor="profession" className="block text-sm font-medium leading-6 text-gray-500">
            Profession<span style={{color: 'gray'}}>*</span>
          </label>
          {professions.map((profession, index) => (
            <div key={index} className="mt-2 mb-2">
              <select
                id={`profession-${index}`}
                name={`profession-${index}`}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={profession}
                onChange={handleInputChange(index, professions, setProfessions)}
                style={{ height: '35px' }}
              >
                <option value="">--Choose a profession--</option>
                <option>Nurse</option>
                <option>Doctor</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <hr style={{margin: '20px 20px'}} />
      <div style={{ textAlign: 'right', marginRight: '20px' }}>
        <button type="button" class="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Invite</button>
      </div>
    </div>
    </Layout>
  );
}