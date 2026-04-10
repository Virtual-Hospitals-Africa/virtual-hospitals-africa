import { ch as groupBy, dE as pMap, cm as entries, au as employees, aW as organizations, a2 as promiseProps, an as addresses, al as SERVER_COUNTRY, aw as employeeDisplay, m as assert, dJ as isString } from "../server-entry.mjs";
import { p as pluralize } from "./pluralize-HYG0Q538.mjs";
const MESSAGE_TARGET_CATEGORIES = {
  regions: ["locality", "administrative_area_level_1", "administrative_area_level_2"],
  organizations: ["organization", "organization_category"],
  health_workers: ["profession", "employee"]
};
const MESSAGE_TYPE_TO_CATEGORY = {
  locality: "regions",
  administrative_area_level_1: "regions",
  administrative_area_level_2: "regions",
  organization: "organizations",
  organization_category: "organizations",
  role: "health_workers",
  employee: "health_workers"
};
function groupByCategory(targets) {
  return groupBy(targets, (target) => MESSAGE_TYPE_TO_CATEGORY[target.target_type]);
}
const BY_TARGET_UUID = /* @__PURE__ */ new Set(["organization", "employee"]);
const TARGET_ENTITY_FETCHERS = {
  async employee(trx, target) {
    assert(target.target_type === "employee");
    assert(target.target_uuid);
    assert(!target.target_value);
    return employees.getById(trx, target.target_uuid);
  },
  async organization(trx, target) {
    assert(target.target_type === "organization");
    assert(target.target_uuid);
    assert(!target.target_value);
    return organizations.getById(trx, target.target_uuid);
  },
  async role(_trx, target) {
    assert(target.target_type === "role");
    assert(!target.target_uuid);
    assert(isString(target.target_value));
    return target.target_value;
  },
  async organization_category(_trx, target) {
    assert(target.target_type === "organization_category");
    assert(!target.target_uuid);
    assert(target.target_value);
    assert(isString(target.target_value));
    return target.target_value;
  },
  async locality(_trx, target) {
    assert(target.target_type === "locality");
    assert(!target.target_uuid);
    assert(target.target_value);
    assert(isString(target.target_value));
    return target.target_value;
  },
  async administrative_area_level_1(_trx, target) {
    assert(target.target_type === "administrative_area_level_1");
    assert(!target.target_uuid);
    assert(target.target_value);
    assert(isString(target.target_value));
    return target.target_value;
  },
  async administrative_area_level_2(_trx, target) {
    assert(target.target_type === "administrative_area_level_2");
    assert(!target.target_uuid);
    assert(target.target_value);
    assert(isString(target.target_value));
    return target.target_value;
  }
};
const TARGET_DISPLAYS = {
  employee(entity) {
    return employeeDisplay(entity);
  },
  organization(entity) {
    return {
      display_name: entity.name,
      description: entity.formatted_address
    };
  },
  role(entity) {
    return {
      display_name: `All ${pluralize(entity, 2)}`,
      description: "Profession"
    };
  },
  organization_category(entity) {
    return {
      display_name: `All ${pluralize(entity, 2)}`,
      description: "Facility Category"
    };
  },
  locality(entity) {
    return {
      display_name: entity,
      description: "City / Town"
    };
  },
  administrative_area_level_1(entity) {
    return {
      display_name: entity,
      description: "Province"
    };
  },
  administrative_area_level_2(entity) {
    return {
      display_name: entity,
      description: "District"
    };
  }
};
const TARGET_GETTERS = {
  async employee(trx, target) {
    const employee = await TARGET_ENTITY_FETCHERS.employee(trx, target);
    return {
      id: target.id,
      target_type: "employee",
      target_category: "health_workers",
      ...TARGET_DISPLAYS.employee(employee),
      employee
    };
  },
  async organization(trx, target) {
    const organization = await TARGET_ENTITY_FETCHERS.organization(trx, target);
    return {
      id: target.id,
      target_type: "organization",
      target_category: "organizations",
      ...TARGET_DISPLAYS.organization(organization),
      organization
    };
  },
  async role(trx, target) {
    const role = await TARGET_ENTITY_FETCHERS.role(trx, target);
    return {
      id: target.id,
      target_type: "role",
      target_category: "health_workers",
      ...TARGET_DISPLAYS.role(role),
      role
    };
  },
  async organization_category(trx, target) {
    const organization_category = await TARGET_ENTITY_FETCHERS.organization_category(trx, target);
    return {
      id: target.id,
      target_type: "organization_category",
      target_category: "organizations",
      ...TARGET_DISPLAYS.organization_category(organization_category),
      organization_category
    };
  },
  async locality(trx, target) {
    const locality = await TARGET_ENTITY_FETCHERS.locality(trx, target);
    return {
      id: target.id,
      target_type: "locality",
      target_category: "regions",
      ...TARGET_DISPLAYS.locality(locality),
      locality
    };
  },
  async administrative_area_level_1(trx, target) {
    const administrative_area_level_1 = await TARGET_ENTITY_FETCHERS.administrative_area_level_1(trx, target);
    return {
      id: target.id,
      target_type: "administrative_area_level_1",
      target_category: "regions",
      ...TARGET_DISPLAYS.administrative_area_level_1(administrative_area_level_1),
      administrative_area_level_1
    };
  },
  async administrative_area_level_2(trx, target) {
    const administrative_area_level_2 = await TARGET_ENTITY_FETCHERS.administrative_area_level_2(trx, target);
    return {
      id: target.id,
      target_type: "administrative_area_level_2",
      target_category: "regions",
      ...TARGET_DISPLAYS.administrative_area_level_2(administrative_area_level_2),
      administrative_area_level_2
    };
  }
};
const MESSAGE_CATEGORY_SEARCH = {
  async regions(trx, search) {
    const country = SERVER_COUNTRY;
    const {
      localities,
      administrative_areas_level_1,
      administrative_areas_level_2
    } = await promiseProps({
      localities: addresses.distinctLocalities(trx, {
        country,
        search,
        limit: 20
      }),
      administrative_areas_level_1: addresses.distinctAdministrativeAreaLevels1(trx, {
        country,
        search,
        limit: 20
      }),
      administrative_areas_level_2: addresses.distinctAdministrativeAreaLevels2(trx, {
        country,
        search,
        limit: 20
      })
    });
    return [...localities.map(({
      locality
    }) => ({
      target_type: "locality",
      target_category: "regions",
      ...TARGET_DISPLAYS.locality(locality),
      locality
    })), ...administrative_areas_level_1.map(({
      administrative_area_level_1
    }) => ({
      target_type: "administrative_area_level_1",
      target_category: "regions",
      ...TARGET_DISPLAYS.administrative_area_level_1(administrative_area_level_1),
      administrative_area_level_1
    })), ...administrative_areas_level_2.map(({
      administrative_area_level_2
    }) => ({
      target_type: "administrative_area_level_2",
      target_category: "regions",
      ...TARGET_DISPLAYS.administrative_area_level_2(administrative_area_level_2),
      administrative_area_level_2
    }))];
  },
  async organizations(trx, search) {
    const organization_search = await organizations.search(trx, {
      search
    }, {
      rows_per_page: 20
    });
    const organization_results = organization_search.results.map((organization) => ({
      target_type: "organization",
      target_category: "organizations",
      ...TARGET_DISPLAYS.organization(organization),
      organization
    }));
    return organization_results;
  },
  async health_workers(trx, search) {
    const employees_search = await employees.search(trx, {
      search
    }, {
      rows_per_page: 20
    });
    const employee_results = employees_search.results.map((employee) => ({
      target_type: "employee",
      target_category: "health_workers",
      ...TARGET_DISPLAYS.employee(employee),
      employee
    }));
    return employee_results;
  }
};
const message_targets = {
  async getTarget(trx, target) {
    return TARGET_GETTERS[target.target_type](trx, target);
  },
  async getMany(trx, targets_record) {
    const rendered_targets = await pMap(entries(targets_record), async ([target_type, target_values = []]) => {
      const by_uuid = BY_TARGET_UUID.has(target_type);
      const target_entities = target_values.map((target_string) => ({
        target_type,
        target_uuid: by_uuid ? target_string : void 0,
        target_value: by_uuid ? void 0 : target_string
      }));
      return pMap(target_entities, async (target) => {
        return message_targets.getTarget(trx, target);
      });
    });
    return rendered_targets.flat();
  },
  async searchTargetCategory(trx, target_category, {
    search
  }) {
    return MESSAGE_CATEGORY_SEARCH[target_category](trx, search);
  }
};
export {
  BY_TARGET_UUID as B,
  MESSAGE_TARGET_CATEGORIES as M,
  groupByCategory as g,
  message_targets as m
};
