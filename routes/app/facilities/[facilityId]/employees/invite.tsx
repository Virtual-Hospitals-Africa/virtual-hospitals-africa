import { useState } from 'preact/hooks';
import { PageProps } from '$fresh/server.ts'

export default function InviteEmployees(props: PageProps) {
  const [emails, setEmails] = useState(['', '', '']);
  const [professions, setProfessions] = useState(['', '', '']);

  const handleInputChange = (index: number, values: string[], setter: (value: string[]) => void) => (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValues = [...values];
    newValues[index] = target.value;
    setter(newValues);
  }

  return (
    <div>
      <h1>Invite Employees</h1>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          <h2>Email</h2>
          {emails.map((email, index) => (
            <input
              type='email'
              value={email}
              onChange={handleInputChange(index, emails, setEmails)}
            />
          ))}
        </div>
        <div>
          <h2>Profession</h2>
          {professions.map((profession, index) => (
            <select value={profession} onChange={handleInputChange(index, professions, setProfessions)}>
              <option value=''>Select profession</option>
              <option value='nurse'>Nurse</option>
              <option value='doctor'>Doctor</option>
            </select>
          ))}
        </div>
      </div>
      <hr />
      <button type="button" class="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Invite</button>
    </div>
  );
}