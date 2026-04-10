import { v as assertOr400, cn as parseWithSchema, bZ as insertable_finding_base, dX as nameAndCategorySnomedConceptBase, dY as IS_A, d8 as literalString, aG as jsonBuildObject, dZ as ATTRIBUTE } from "../server-entry.mjs";
import { j as json } from "./responses-Vcjs2Fhe.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const handler$1 = {
  async GET(ctx) {
    assertOr400(ctx.req.headers.get("accept") === "application/json");
    const s_expression = ctx.url.searchParams.get("s_expression");
    assertOr400(s_expression, "Missing s_expression parameter");
    const node = parseWithSchema(s_expression, insertable_finding_base);
    const predefined_attributes = await ctx.state.trx.selectFrom("snomed_relationship").innerJoin("snomed_inferred_canonical_name_and_category as rel_type", "rel_type.id", "snomed_relationship.type_id").innerJoin("snomed_inferred_canonical_name_and_category as rel_dest", "rel_dest.id", "snomed_relationship.destination_id").where("snomed_relationship.source_id", "in", nameAndCategorySnomedConceptBase(ctx.state.trx, node.specific_snomed_concept)).where("snomed_relationship.active", "=", true).where("snomed_relationship.type_id", "!=", IS_A.id).select((eb) => [literalString("attribute").as("atom"), jsonBuildObject({
      atom: literalString("snomed_concept"),
      name: literalString(ATTRIBUTE.name),
      category: literalString(ATTRIBUTE.category)
    }).as("root_snomed_concept"), jsonBuildObject({
      atom: literalString("snomed_concept"),
      name: eb.ref("rel_type.name").$notNull(),
      category: eb.ref("rel_type.category").$notNull()
    }).as("specific_snomed_concept"), jsonBuildObject({
      atom: literalString("snomed_concept"),
      name: eb.ref("rel_dest.name").$notNull(),
      category: eb.ref("rel_dest.category").$notNull()
    }).as("value")]).orderBy("rel_type.name").execute();
    return json({
      ...node,
      predefined_attributes
    });
  }
};
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_snomed_by_s_expression = void 0;
export {
  config,
  css,
  _freshRoute___app_snomed_by_s_expression as default,
  handler,
  handlers
};
