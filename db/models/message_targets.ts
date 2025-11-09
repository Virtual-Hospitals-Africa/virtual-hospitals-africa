// deno-lint-ignore-file require-await
import { assert } from 'std/assert/assert.ts'
import { JsonValue, MessageTargetType, Profession } from '../../db.d.ts'
import {
  MessageTargetEntities,
  RenderedEmployee,
  RenderedMessageTargets,
  RenderedOrganization,
  TrxOrDb,
} from '../../types.ts'
import * as organizations from './organizations.ts'
import * as employees from './employees.ts'
import isString from '../../util/isString.ts'
import { ProfessionSchema } from '../../shared/profession.ts'

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
  async region(
    _trx: TrxOrDb,
    target: IntermediateTargetResult<'region'>,
  ): Promise<string> {
    assert(target.target_type === 'region')
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
    return entity.display.display_name
  },
  organization(entity: RenderedOrganization): string {
    return entity.name
  },
  profession(entity: Profession): string {
    return entity
  },
  region(entity: string): string {
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
  async region(
    trx: TrxOrDb,
    target: IntermediateTargetResult<'region'>,
  ): Promise<RenderedMessageTargets['region']> {
    const region = await TARGET_ENTITY_FETCHERS.region(trx, target)
    const display_name = TARGET_DISPLAYS.region(region)
    return {
      id: target.id,
      target_type: 'region',
      display_name,
      region,
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
