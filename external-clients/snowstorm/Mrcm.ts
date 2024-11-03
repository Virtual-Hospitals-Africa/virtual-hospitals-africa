// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { ConceptMini, ItemsPageConceptMini } from './data-contracts.ts'
import { HttpClient, RequestParams } from './http-client.ts'

export class Mrcm<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description The parentIds must be the set ids of stated parents. If creating post-coordinated expressions be sure to set the content type to POSTCOORDINATED.
   *
   * @tags MRCM
   * @name RetrieveDomainAttributes
   * @summary Retrieve MRCM domain attributes applicable for the given stated parents.
   * @request GET:/mrcm/{branch}/domain-attributes
   */
  retrieveDomainAttributes = (
    branch: string,
    query?: {
      /** @uniqueItems true */
      parentIds?: number[]
      /** @default true */
      proximalPrimitiveModeling?: boolean
      /** @default "NEW_PRECOORDINATED" */
      contentType?:
        | 'PRECOORDINATED'
        | 'NEW_PRECOORDINATED'
        | 'POSTCOORDINATED'
        | 'ALL'
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageConceptMini, any>({
      path: `/mrcm/${branch}/domain-attributes`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags MRCM
   * @name RetrieveConceptModelAttributeHierarchy
   * @summary Retrieve all active concept model attributes in a hierarchical structure.
   * @request GET:/mrcm/{branch}/concept-model-attribute-hierarchy
   */
  retrieveConceptModelAttributeHierarchy = (
    branch: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptMini, any>({
      path: `/mrcm/${branch}/concept-model-attribute-hierarchy`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags MRCM
   * @name RetrieveAttributeValues
   * @summary Retrieve valid values for the given attribute and term prefix.
   * @request GET:/mrcm/{branch}/attribute-values/{attributeId}
   */
  retrieveAttributeValues = (
    branch: string,
    attributeId: string,
    query: {
      /** @default "NEW_PRECOORDINATED" */
      contentType?:
        | 'PRECOORDINATED'
        | 'NEW_PRECOORDINATED'
        | 'POSTCOORDINATED'
        | 'ALL'
      termPrefix: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageConceptMini, any>({
      path: `/mrcm/${branch}/attribute-values/${attributeId}`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
