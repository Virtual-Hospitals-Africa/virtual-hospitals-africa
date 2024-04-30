import { Kysely } from 'kysely'
import { create } from '../create.ts'

export default create(
  ['ClientApplication'],
  async (db: Kysely<any>) => {
    await db.insertInto('ClientApplication').values({
      "id": "16cb17a2-161b-4379-85db-d3bfc89f31a3",
      "content": "{\"meta\":{\"project\":\"54a1b2f3-e647-40be-9d2d-a167f5d20602\",\"versionId\":\"eeb5a703-185c-48f3-802b-090be3c53bae\",\"lastUpdated\":\"2024-04-23T01:56:22.761Z\",\"author\":{\"reference\":\"Practitioner/42ef52ed-68cd-41c5-8920-5211d1aafe0a\",\"display\":\"Medplum Admin\"},\"compartment\":[{\"reference\":\"Project/54a1b2f3-e647-40be-9d2d-a167f5d20602\"}]},\"resourceType\":\"ClientApplication\",\"name\":\"Virtual Hospitals Africa\",\"secret\":\"1620cfa0b82501d83a81f17a0dcf6299d86f43bc7a4062887d6c93a740063c3c\",\"id\":\"16cb17a2-161b-4379-85db-d3bfc89f31a3\"}",
      "lastUpdated": "2024-04-22 21:56:22.761-04",
      "compartments": "{54a1b2f3-e647-40be-9d2d-a167f5d20602}",
      "name": "Virtual Hospitals Africa",
      "deleted": false,
      "_profile": null,
      "_security": null,
      "_source": null,
      "_tag": null,
      "projectId": "54a1b2f3-e647-40be-9d2d-a167f5d20602"
    }).execute()
  },
)
