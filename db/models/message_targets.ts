// deno-lint-ignore-file require-await
import { assert } from 'std/assert/assert.ts'
import { JsonValue, MessageTargetType, Profession } from '../../db.d.ts'
import {
  MessageTargetEntities,
  RenderedEmployee,
  RenderedMessageTarget,
  RenderedMessageTargets,
  RenderedOrganization,
  TrxOrDb,
} from '../../types.ts'
import * as organizations from './organizations.ts'
import * as employees from './employees.ts'
import isString from '../../util/isString.ts'
import { ProfessionSchema } from '../../shared/profession.ts'
import { healthWorkerDisplay } from '../../util/healthWorkerDisplay.ts'
import { MessageTargetCategory } from '../../shared/message_targets.ts'

type IntermediateTargetResult<TargetType extends MessageTargetType> = {
  id: string
  target_type: TargetType
  target_uuid: string | null
  target_value: JsonValue
}

const TARGET_ENTITY_FETCHERS = {
  async employment(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'employment'>,
  ): Promise<RenderedEmployee> {
    assert(target.target_type === 'employment')
    assert(target.target_uuid)
    assert(!target.target_value)
    return employees.getById(trx, target.target_uuid)
  },
  async organization(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'organization'>,
  ): Promise<RenderedOrganization> {
    assert(target.target_type === 'organization')
    assert(target.target_uuid)
    assert(!target.target_value)
    return organizations.getById(trx, target.target_uuid)
  },
  async profession(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'profession'>,
  ): Promise<Profession> {
    assert(target.target_type === 'profession')
    assert(!target.target_uuid)
    assert(target.target_value)
    return ProfessionSchema.parse(target.target_value)
  },
  async organization_category(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'organization_category'>,
  ): Promise<string> {
    assert(target.target_type === 'organization_category')
    assert(!target.target_uuid)
    assert(target.target_value)
    assert(isString(target.target_value))
    return target.target_value
  },
  async locality(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'locality'>,
  ): Promise<string> {
    assert(target.target_type === 'locality')
    assert(!target.target_uuid)
    assert(target.target_value)
    assert(isString(target.target_value))
    return target.target_value
  },
  async administrative_area_level_1(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'administrative_area_level_1'>,
  ): Promise<string> {
    assert(target.target_type === 'administrative_area_level_1')
    assert(!target.target_uuid)
    assert(target.target_value)
    assert(isString(target.target_value))
    return target.target_value
  },
  async administrative_area_level_2(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'administrative_area_level_2'>,
  ): Promise<string> {
    assert(target.target_type === 'administrative_area_level_2')
    assert(!target.target_uuid)
    assert(target.target_value)
    assert(isString(target.target_value))
    return target.target_value
  },
} satisfies {
  [T in MessageTargetType]: ((
    trx: TrxOrDb,
    target: IntermediateTargetResult<T>,
  ) => Promise<MessageTargetEntities[T]>)
}

const TARGET_DISPLAYS = {
  employment(entity: RenderedEmployee): string {
    return healthWorkerDisplay(entity.name, entity.organizations[0])
      .display_name
  },
  organization(entity: RenderedOrganization): string {
    return entity.name
  },
  profession(entity: Profession): string {
    return entity
  },
  organization_category(entity: string): string {
    return entity
  },
  locality(entity: string): string {
    return entity
  },
  administrative_area_level_1(entity: string): string {
    return entity
  },
  administrative_area_level_2(entity: string): string {
    return entity
  },
} satisfies {
  [T in MessageTargetType]: ((
    entity: MessageTargetEntities[T],
  ) => string)
}

// Don't love the code duplication, but w.e. it's easily to make new ones via copy-pasta
const TARGET_GETTERS = {
  async employment(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'employment'>,
  ): Promise<RenderedMessageTargets['employment']> {
    const employment = await TARGET_ENTITY_FETCHERS.employment(trx, target)
    const display_name = TARGET_DISPLAYS.employment(employment)
    return {
      id: target.id,
      target_type: 'employment',
      display_name,
      employment,
    }
  },
  async organization(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'organization'>,
  ): Promise<RenderedMessageTargets['organization']> {
    const organization = await TARGET_ENTITY_FETCHERS.organization(trx, target)
    const display_name = TARGET_DISPLAYS.organization(organization)
    return {
      id: target.id,
      target_type: 'organization',
      display_name,
      organization,
    }
  },
  async profession(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'profession'>,
  ): Promise<RenderedMessageTargets['profession']> {
    const profession = await TARGET_ENTITY_FETCHERS.profession(trx, target)
    const display_name = TARGET_DISPLAYS.profession(profession)
    return {
      id: target.id,
      target_type: 'profession',
      display_name,
      profession,
    }
  },
  async organization_category(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'organization_category'>,
  ): Promise<RenderedMessageTargets['organization_category']> {
    const organization_category = await TARGET_ENTITY_FETCHERS.organization_category(trx, target)
    const display_name = TARGET_DISPLAYS.organization_category(organization_category)
    return {
      id: target.id,
      target_type: 'organization_category',
      display_name,
      organization_category,
    }
  },
  async locality(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'locality'>,
  ): Promise<RenderedMessageTargets['locality']> {
    const locality = await TARGET_ENTITY_FETCHERS.locality(trx, target)
    const display_name = TARGET_DISPLAYS.locality(locality)
    return {
      id: target.id,
      target_type: 'locality',
      display_name,
      locality,
    }
  },
  async administrative_area_level_1(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'administrative_area_level_1'>,
  ): Promise<RenderedMessageTargets['administrative_area_level_1']> {
    const administrative_area_level_1 = await TARGET_ENTITY_FETCHERS.administrative_area_level_1(trx, target)
    const display_name = TARGET_DISPLAYS.administrative_area_level_1(administrative_area_level_1)
    return {
      id: target.id,
      target_type: 'administrative_area_level_1',
      display_name,
      administrative_area_level_1,
    }
  },
  async administrative_area_level_2(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'administrative_area_level_2'>,
  ): Promise<RenderedMessageTargets['administrative_area_level_2']> {
    const administrative_area_level_2 = await TARGET_ENTITY_FETCHERS.administrative_area_level_2(trx, target)
    const display_name = TARGET_DISPLAYS.administrative_area_level_2(administrative_area_level_2)
    return {
      id: target.id,
      target_type: 'administrative_area_level_2',
      display_name,
      administrative_area_level_2,
    }
  },
} satisfies {
  [T in MessageTargetType]: ((
    trx: TrxOrDb,
    target: IntermediateTargetResult<T>,
  ) => Promise<RenderedMessageTargets[T]>)
}

export async function getTarget<TargetType extends MessageTargetType>(
  trx: TrxOrDb,
  target: IntermediateTargetResult<TargetType>,
): Promise<RenderedMessageTargets[TargetType]> {
  // deno-lint-ignore no-explicit-any
  return TARGET_GETTERS[target.target_type](trx, target as any) as Promise<
    RenderedMessageTargets[TargetType]
  >
}

const MESSAGE_CATEGORY_SEARCH = {
  async regions(trx: TrxOrDb, search: string): Promise<Array<
    RenderedMessageTargets['locality'] |
    RenderedMessageTargets['administrative_area_level_1'] |
    RenderedMessageTargets['administrative_area_level_2']
    >> {
    throw new Error('Implement')
  },
  async organizations(trx: TrxOrDb, search: string): Promise<Array<
    RenderedMessageTargets['organization'] |
    RenderedMessageTargets['organization_category']
    >> {
throw new Error('Implement')
  },
  async health_workers(trx: TrxOrDb, search: string): Promise<Array<
    RenderedMessageTargets['profession'] |
    RenderedMessageTargets['employment']
    >> {
throw new Error('Implement')
  },
}

export async function searchTargetCategory<TargetCategory extends MessageTargetCategory>(
  trx: TrxOrDb,
  target_category: TargetCategory,
  { search }: {search: string}
): Promise<RenderedMessageTarget[]> {
  return MESSAGE_CATEGORY_SEARCH[target_category](trx, search)
}

