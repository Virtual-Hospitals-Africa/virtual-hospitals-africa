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
  AsyncConceptChangeBatch,
  BodyBuilder,
  Concept,
  ConceptBulkLoadRequestComponent,
  ConceptComponent,
  ConceptHistory,
  ConceptMiniComponent,
  ConceptView,
  ConceptViewComponent,
  InvalidContent,
  ItemsPageConceptComponent,
  ItemsPageObjectComponent,
  PageBrowserDescriptionSearchResultComponent,
  RefSetMemberPageWithBucketAggregationsReferenceSetMember,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Browser<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description During content authoring previous versions of the concept can be loaded from version control. To do this use the branch path format {branch@yyyy-MM-ddTHH:mm:ss.SSSZ} or {branch@epoch_milliseconds}. The version of the concept when the branch was created can be loaded using {branch@-}.
   *
   * @tags Concepts
   * @name FindBrowserConcept
   * @summary Load a concept in the browser format.
   * @request GET:/browser/{branch}/concepts/{conceptId}
   */
  findBrowserConcept = (
    branch: string,
    conceptId: string,
    query?: {
      /** If this parameter is set a descendantCount will be included in the response using stated/inferred as requested. */
      descendantCountForm?: 'inferred' | 'stated' | 'additional'
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptViewComponent, any>({
      path: `/browser/${branch}/concepts/${conceptId}`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name UpdateConcept
   * @request PUT:/browser/{branch}/concepts/{conceptId}
   */
  updateConcept = (
    branch: string,
    conceptId: string,
    data: ConceptViewComponent,
    query?: {
      /** @default false */
      validate?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptViewComponent, any>({
      path: `/browser/${branch}/concepts/${conceptId}`,
      method: 'PUT',
      query: query,
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description Validation using the Snomed-Drools project.
   *
   * @tags Validation
   * @name ValidateConcepts
   * @request POST:/browser/{branch}/validate/concepts
   */
  validateConcepts = (
    branch: string,
    data: Concept[],
    params: RequestParams = {},
  ) =>
    this.request<InvalidContent[], any>({
      path: `/browser/${branch}/validate/concepts`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description Validation using the Snomed-Drools project.
   *
   * @tags Validation
   * @name ValidateConcept
   * @request POST:/browser/{branch}/validate/concept
   */
  validateConcept = (
    branch: string,
    data: Concept,
    params: RequestParams = {},
  ) =>
    this.request<InvalidContent[], any>({
      path: `/browser/${branch}/validate/concept`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description When enabled 'searchAfter' can be used for unlimited pagination. Load the first page then take the 'searchAfter' value from the response and use that as a parameter in the next page request instead of 'number'.
   *
   * @tags Concepts
   * @name GetBrowserConcepts1
   * @summary Load concepts in the browser format.
   * @request GET:/browser/{branch}/concepts
   */
  getBrowserConcepts1 = (
    branch: string,
    query?: {
      conceptIds?: number[]
      /**
       * @format int32
       * @default 0
       */
      number?: number
      /**
       * @format int32
       * @default 100
       */
      size?: number
      searchAfter?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageConceptComponent, any>({
      path: `/browser/${branch}/concepts`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name CreateConcept
   * @request POST:/browser/{branch}/concepts
   */
  createConcept = (
    branch: string,
    data: ConceptViewComponent,
    query?: {
      /** @default false */
      validate?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptViewComponent, any>({
      path: `/browser/${branch}/concepts`,
      method: 'POST',
      query: query,
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description Concepts can be created or updated using this endpoint. Use the location header in the response to check the job status.
   *
   * @tags Concepts
   * @name CreateUpdateConceptBulkChange
   * @summary Start a bulk concept create/update job.
   * @request POST:/browser/{branch}/concepts/bulk
   */
  createUpdateConceptBulkChange = (
    branch: string,
    data: ConceptView[],
    params: RequestParams = {},
  ) =>
    this.request<BodyBuilder, any>({
      path: `/browser/${branch}/concepts/bulk`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name GetBrowserConcepts
   * @request POST:/browser/{branch}/concepts/bulk-load
   */
  getBrowserConcepts = (
    branch: string,
    data: ConceptBulkLoadRequestComponent,
    params: RequestParams = {},
  ) =>
    this.request<ConceptComponent[], any>({
      path: `/browser/${branch}/concepts/bulk-load`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description Search for reference set ids.
   *
   * @tags Refset Members
   * @name FindBrowserReferenceSetMembersWithAggregations
   * @request GET:/browser/{branch}/members
   */
  findBrowserReferenceSetMembersWithAggregations = (
    branch: string,
    query?: {
      /** A reference set identifier or ECL expression can be used to limit the reference sets searched. Example: <723564002 */
      referenceSet?: string
      /** A concept identifier or ECL expression can be used to limit the modules searched. Example: <900000000000445007 */
      module?: string
      /**
       * Set of referencedComponentId ids to limit search
       * @uniqueItems true
       */
      referencedComponentId?: string[]
      active?: boolean
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 10
       */
      limit?: number
      searchAfter?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<RefSetMemberPageWithBucketAggregationsReferenceSetMember, any>(
      {
        path: `/browser/${branch}/members`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      },
    )
  /**
   * @description The Accept-Language header is used to specify the user's preferred language, 'en' is always added as a fallback if not already included in the list. Each language is used as an optional clause for matching and will include the correct character folding behaviour for that language. The Accept-Language header list is also used to chose the best translated FSN and PT values in the response.
   *
   * @tags Descriptions
   * @name FindBrowserDescriptions
   * @summary Search for concept descriptions.
   * @request GET:/browser/{branch}/descriptions
   */
  findBrowserDescriptions = (
    branch: string,
    query?: {
      term?: string
      active?: boolean
      /** @uniqueItems true */
      module?: string[]
      /**
       * Set of two character language codes to match. The English language code 'en' will not be added automatically, in contrast to the Accept-Language header which always includes it. Accept-Language header still controls result FSN and PT language selection.
       * @uniqueItems true
       */
      language?: string[]
      /**
       * Set of description type ids to use include. Defaults to any. Pick descendants of '900000000000446008 | Description type (core metadata concept) |'. Examples: 900000000000003001 (FSN), 900000000000013009 (Synonym), 900000000000550004 (Definition)
       * @uniqueItems true
       */
      type?: number[]
      /** @deprecated */
      semanticTag?: string
      /**
       * Set of semantic tags.
       * @uniqueItems true
       */
      semanticTags?: string[]
      /**
       * Set of description language reference sets. The description must be preferred in at least one of these to match.
       * @uniqueItems true
       */
      preferredIn?: number[]
      /**
       * Set of description language reference sets. The description must be acceptable in at least one of these to match.
       * @uniqueItems true
       */
      acceptableIn?: number[]
      /**
       * Set of description language reference sets. The description must be preferred OR acceptable in at least one of these to match.
       * @uniqueItems true
       */
      preferredOrAcceptableIn?: number[]
      conceptActive?: boolean
      conceptRefset?: string
      /** @default false */
      groupByConcept?: boolean
      /** @default "STANDARD" */
      searchMode?: 'STANDARD' | 'REGEX' | 'WHOLE_WORD' | 'WILDCARD'
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
      path: `/browser/${branch}/descriptions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptParents
   * @request GET:/browser/{branch}/concepts/{conceptId}/parents
   */
  findConceptParents = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default "inferred" */
      form?: 'inferred' | 'stated' | 'additional'
      /** @default false */
      includeDescendantCount?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptMiniComponent[], any>({
      path: `/browser/${branch}/concepts/${conceptId}/parents`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description Response details historical changes for the given Concept.
   *
   * @tags Concepts
   * @name ViewConceptHistory
   * @summary View the history of a Concept.
   * @request GET:/browser/{branch}/concepts/{conceptId}/history
   */
  viewConceptHistory = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default false */
      showFutureVersions?: boolean
      /** @default false */
      showInternalReleases?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptHistory, any>({
      path: `/browser/${branch}/concepts/${conceptId}/history`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptChildren
   * @request GET:/browser/{branch}/concepts/{conceptId}/children
   */
  findConceptChildren = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default "inferred" */
      form?: 'inferred' | 'stated' | 'additional'
      /** @default false */
      includeDescendantCount?: boolean
      checkDescendantsWithinRefsetId?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptMiniComponent[], any>({
      path: `/browser/${branch}/concepts/${conceptId}/children`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptAncestors
   * @request GET:/browser/{branch}/concepts/{conceptId}/ancestors
   */
  findConceptAncestors = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default "inferred" */
      form?: 'inferred' | 'stated' | 'additional'
    },
    params: RequestParams = {},
  ) =>
    this.request<object[], any>({
      path: `/browser/${branch}/concepts/${conceptId}/ancestors`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptOrIdentifierReferencedConcept
   * @request GET:/browser/{branch}/concepts/{componentId}/concept-or-identifier-ref-concept
   */
  findConceptOrIdentifierReferencedConcept = (
    branch: string,
    componentId: string,
    query?: {
      /** Identifier scheme id to combine with alternative identifier */
      identifierScheme?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageObjectComponent, any>({
      path:
        `/browser/${branch}/concepts/${componentId}/concept-or-identifier-ref-concept`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name GetConceptBulkChange
   * @summary Fetch the status of a bulk concept creation or update.
   * @request GET:/browser/{branch}/concepts/bulk/{bulkChangeId}
   */
  getConceptBulkChange = (
    branch: string,
    bulkChangeId: string,
    params: RequestParams = {},
  ) =>
    this.request<AsyncConceptChangeBatch, any>({
      path: `/browser/${branch}/concepts/bulk/${bulkChangeId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptAncestorPaths
   * @request GET:/browser/{branch}/concepts/ancestor-paths
   */
  findConceptAncestorPaths = (
    branch: string,
    query?: {
      conceptIds?: number[]
      /** @default "inferred" */
      form?: 'inferred' | 'stated' | 'additional'
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptMiniComponent[], any>({
      path: `/browser/${branch}/concepts/ancestor-paths`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
