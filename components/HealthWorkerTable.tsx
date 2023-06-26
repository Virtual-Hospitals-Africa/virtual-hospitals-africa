import { FunctionComponent, h } from 'preact'
import { HealthWorker, Profession } from '../types.ts'

interface EmployeeTable {
    isAdmin : boolean
    employees : EmployeeInfo[]
}

interface EmployeeInfo {
  name: string
  profession: Profession
  email: string
  facility: string
}

const HealthWorkerTable: FunctionComponent<EmployeeTable> = ({
    isAdmin,
    employees,
}) => {

    return (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">Healthcare Workers</h1>
              <p className="mt-2 text-sm text-gray-700">
                Here you can view all the healthcare workers registered on virtual hospitals africa
              </p>
            </div>
            {isAdmin && <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add healthcare worker
              </button>
            </div>}
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Profession
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          facility
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {employees.map((employee) => (
                        <tr key={employee.email}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {employee.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.profession}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.facility}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-indigo-600 hover:text-indigo-900">
                              Resend invite
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
}

export default HealthWorkerTable;