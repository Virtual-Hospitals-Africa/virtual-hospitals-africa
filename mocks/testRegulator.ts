import generateUUID from '../util/uuid.ts'

export default function testRegulator() {
  return {
    name: `Test Regulator ${generateUUID()}`,
    email: generateUUID() + '@example.com',
    country: 'ZW',
  }
}
