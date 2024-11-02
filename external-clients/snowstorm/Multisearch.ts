// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  ItemsPageBrowserDescriptionSearchResultComponent,
  ItemsPageConceptMiniComponent,
  MultibranchDescriptionSearchRequestComponent,
  PageBrowserDescriptionSearchResultComponent,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Multisearch<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Search descriptions across multiple Code Systems.
   *
   * @tags MultiSearch
   * @name FindDescriptions1
   * @request GET:/multisearch/descriptions
   */
  findDescriptions1 = (
    query: {
      term: string
      active?: boolean
      module?: string[]
      ecl?: string
      /**
       * Set of two character language codes to match. The English language code 'en' will not be added automatically, in contrast to the Accept-Language header which always includes it. Accept-Language header still controls result FSN and PT language selection.
       * @uniqueItems true
       */
      language?: string[]
      /**
       * Set of description types to include. Pick descendants of '900000000000446008 | Description type (core metadata concept) |'.
       * @uniqueItems true
       */
      type?: number[]
      conceptActive?: boolean
      /** @default "ALL_PUBLISHED_CONTENT" */
      contentScope?: 'ALL_PUBLISHED_CONTENT'
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 50
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageBrowserDescriptionSearchResultComponent, any>({
      path: `/multisearch/descriptions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description Search descriptions across multiple Code Systems. Can search specified branches in addition to all published branches.
   *
   * @tags MultiSearch
   * @name FindDescriptionsIncludingRequestedBranches
   * @request POST:/multisearch/descriptions
   */
  findDescriptionsIncludingRequestedBranches = (
    query: {
      term: string
      active?: boolean
      module?: string[]
      ecl?: string
      /**
       * Set of two character language codes to match. The English language code 'en' will not be added automatically, in contrast to the Accept-Language header which always includes it. Accept-Language header still controls result FSN and PT language selection.
       * @uniqueItems true
       */
      language?: string[]
      /**
       * Set of description types to include. Pick descendants of '900000000000446008 | Description type (core metadata concept) |'.
       * @uniqueItems true
       */
      type?: number[]
      conceptActive?: boolean
      /** @default "ALL_PUBLISHED_CONTENT" */
      contentScope?: 'ALL_PUBLISHED_CONTENT'
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 50
       */
      limit?: number
    },
    data: MultibranchDescriptionSearchRequestComponent,
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageBrowserDescriptionSearchResultComponent, any>({
      path: `/multisearch/descriptions`,
      method: 'POST',
      query: query,
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags MultiSearch
   * @name FindDescriptionsReferenceSets
   * @summary Search descriptions across multiple Code Systems returning reference set membership bucket.
   * @request GET:/multisearch/descriptions/referencesets
   */
  findDescriptionsReferenceSets = (
    query: {
      term: string
      active?: boolean
      module?: string[]
      /**
       * Set of two character language codes to match. The English language code 'en' will not be added automatically, in contrast to the Accept-Language header which always includes it. Accept-Language header still controls result FSN and PT language selection.
       * @uniqueItems true
       */
      language?: string[]
      /**
       * Set of description types to include. Pick descendants of '900000000000446008 | Description type (core metadata concept) |'.
       * @uniqueItems true
       */
      type?: number[]
      conceptActive?: boolean
      /** @default "ALL_PUBLISHED_CONTENT" */
      contentScope?: 'ALL_PUBLISHED_CONTENT'
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 50
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<PageBrowserDescriptionSearchResultComponent, any>({
      path: `/multisearch/descriptions/referencesets`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags MultiSearch
   * @name FindConcepts1
   * @summary Search concepts across multiple Code Systems.
   * @request GET:/multisearch/concepts
   */
  findConcepts1 = (
    query?: {
      /** @uniqueItems true */
      conceptIds?: string[]
      active?: boolean
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 50
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageConceptMiniComponent, any>({
      path: `/multisearch/concepts`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
