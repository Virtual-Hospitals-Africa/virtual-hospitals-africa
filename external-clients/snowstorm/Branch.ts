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
  AsyncRefsetMemberChangeBatch,
  AuthoringStatsSummary,
  Classification,
  ClassificationUpdateRequest,
  ConceptDescriptionsResultComponent,
  ConceptMicro,
  ConceptMini,
  ConceptMiniComponent,
  ConceptReferencesResult,
  ConceptSearchRequest,
  ConceptViewComponent,
  CreatePostCoordinatedExpressionRequest,
  DescriptionComponent,
  DescriptionMicro,
  Expression,
  ExpressionStringPojo,
  InactivationTypeAndConceptIdListComponent,
  InboundRelationshipsResultComponent,
  IntegrityIssueReport,
  ItemsPageClassification,
  ItemsPageDescriptionComponent,
  ItemsPageEquivalentConceptsResponse,
  ItemsPageIdentifierComponent,
  ItemsPageObject,
  ItemsPageObjectComponent,
  ItemsPageReferenceSetMemberComponent,
  ItemsPageRelationshipChange,
  ItemsPageRelationshipComponent,
  MemberIdsPojoComponent,
  MemberSearchRequestComponent,
  PostCoordinatedExpression,
  ReferenceSetMemberComponent,
  ReferenceSetMemberViewComponent,
  RelationshipComponent,
  RelationshipIdPojo,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Branch<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Refset Members
   * @name FetchMember
   * @request GET:/{branch}/members/{uuid}
   */
  fetchMember = (branch: string, uuid: string, params: RequestParams = {}) =>
    this.request<ReferenceSetMemberComponent, any>({
      path: `/${branch}/members/${uuid}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name UpdateMember
   * @summary Update a reference set member.
   * @request PUT:/{branch}/members/{uuid}
   */
  updateMember = (
    branch: string,
    uuid: string,
    data: ReferenceSetMemberViewComponent,
    params: RequestParams = {},
  ) =>
    this.request<ReferenceSetMemberViewComponent, any>({
      path: `/${branch}/members/${uuid}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name DeleteMember
   * @summary Delete a reference set member.
   * @request DELETE:/{branch}/members/{uuid}
   */
  deleteMember = (
    branch: string,
    uuid: string,
    query?: {
      /**
       * Force the deletion of a released member.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/members/${uuid}`,
      method: 'DELETE',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name FindClassification
   * @summary Retrieve a classification on a branch
   * @request GET:/{branch}/classifications/{classificationId}
   */
  findClassification = (
    branch: string,
    classificationId: string,
    params: RequestParams = {},
  ) =>
    this.request<Classification, any>({
      path: `/${branch}/classifications/${classificationId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description Update the specified classification run by changing its state property. Saving the results is an async operation due to the possible high number of changes. It is advised to fetch the state of the classification run until the state changes to 'SAVED' or 'SAVE_FAILED'. Currently only the state can be changed from 'COMPLETED' to 'SAVED'.
   *
   * @tags Classification
   * @name UpdateClassification
   * @summary Update a classification on a branch.
   * @request PUT:/{branch}/classifications/{classificationId}
   */
  updateClassification = (
    branch: string,
    classificationId: string,
    data: ClassificationUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/classifications/${classificationId}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description Returns a report containing an entry for each type of issue found together with a map of components which still need to be fixed. In the component map each key represents an existing component and the corresponding map value is the id of a component which is missing or inactive.
   *
   * @tags Branching
   * @name UpgradeIntegrityCheck
   * @summary Perform integrity check against changed components during extension upgrade on the extension main branch and fix branch.
   * @request POST:/{branch}/upgrade-integrity-check
   */
  upgradeIntegrityCheck = (
    branch: string,
    query: {
      /** Extension main branch e.g MAIN/{Code System} */
      extensionMainBranchPath: string
    },
    params: RequestParams = {},
  ) =>
    this.request<IntegrityIssueReport, any>({
      path: `/${branch}/upgrade-integrity-check`,
      method: 'POST',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name FindRefsetMembers1
   * @summary Search for reference set members.
   * @request GET:/{branch}/members
   */
  findRefsetMembers1 = (
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
      isNullEffectiveTime?: boolean
      /**
       * Set of target component ids to limit search
       * @uniqueItems true
       */
      targetComponent?: string[]
      mapTarget?: string
      /** Search by concept identifiers within an owlExpression. */
      owlExpressionConceptId?: string
      /** Return axiom members with a GCI owlExpression. */
      owlExpressionGci?: boolean
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
      searchAfter?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageReferenceSetMemberComponent, any>({
      path: `/${branch}/members`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description If the 'moduleId' is not set the 'defaultModuleId' will be used from branch metadata (resolved recursively).
   *
   * @tags Refset Members
   * @name CreateMember
   * @summary Create a reference set member.
   * @request POST:/{branch}/members
   */
  createMember = (
    branch: string,
    data: ReferenceSetMemberViewComponent,
    params: RequestParams = {},
  ) =>
    this.request<ReferenceSetMemberViewComponent, any>({
      path: `/${branch}/members`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name DeleteMembers
   * @summary Batch delete reference set members.
   * @request DELETE:/{branch}/members
   */
  deleteMembers = (
    branch: string,
    data: MemberIdsPojoComponent,
    query?: {
      /**
       * Force the deletion of released members.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/members`,
      method: 'DELETE',
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name FindRefsetMembers
   * @summary Search for reference set members using bulk filters
   * @request POST:/{branch}/members/search
   */
  findRefsetMembers = (
    branch: string,
    data: MemberSearchRequestComponent,
    query?: {
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
    this.request<ItemsPageReferenceSetMemberComponent, any>({
      path: `/${branch}/members/search`,
      method: 'POST',
      query: query,
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description Reference set members can be created or updated using this endpoint. Use the location header in the response to check the job status. If the 'moduleId' is not set the 'defaultModuleId' will be used from branch metadata (resolved recursively).
   *
   * @tags Refset Members
   * @name CreateUpdateMembersBulkChange
   * @summary Start a bulk reference set member create/update job.
   * @request POST:/{branch}/members/bulk
   */
  createUpdateMembersBulkChange = (
    branch: string,
    data: ReferenceSetMemberViewComponent[],
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/members/bulk`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description Returns a report containing an entry for each type of issue found together with a map of components. In the component map each key represents an existing component and the corresponding map value is the id of a component which is missing or inactive.
   *
   * @tags Branching
   * @name IntegrityCheck
   * @summary Perform integrity check against changed components on this branch.
   * @request POST:/{branch}/integrity-check
   */
  integrityCheck = (branch: string, params: RequestParams = {}) =>
    this.request<IntegrityIssueReport, any>({
      path: `/${branch}/integrity-check`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * @description Returns a report containing an entry for each type of issue found together with a map of components. In the component map each key represents an existing component and the corresponding map value is the id of a component which is missing or inactive.
   *
   * @tags Branching
   * @name FullIntegrityCheck
   * @summary Perform integrity check against all components on this branch.
   * @request POST:/{branch}/integrity-check-full
   */
  fullIntegrityCheck = (branch: string, params: RequestParams = {}) =>
    this.request<IntegrityIssueReport, any>({
      path: `/${branch}/integrity-check-full`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * @description <b>Work In Progress</b>. This endpoint can be used for testing the validation of a postcoordinated expression, stated in close to user form, and any transformation to the classifiable form as required.
   *
   * @tags Postcoordination
   * @name TransformExpression
   * @summary Validate and transform a postcoordinated expression.
   * @request POST:/{branch}/expressions/transform
   */
  transformExpression = (
    branch: string,
    data: CreatePostCoordinatedExpressionRequest,
    params: RequestParams = {},
  ) =>
    this.request<PostCoordinatedExpression, any>({
      path: `/${branch}/expressions/transform`,
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
   * @name Search
   * @request POST:/{branch}/concepts/search
   */
  search = (
    branch: string,
    data: ConceptSearchRequest,
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageObject<ConceptMini>, any>({
      path: `/${branch}/concepts/search`,
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
   * @name CopyConcepts
   * @request POST:/{branch}/concepts/copy
   */
  copyConcepts = (
    branch: string,
    query: {
      /** Source branch where the concepts are selected from. */
      sourceBranch: string
      /** ECL expression for selecting concepts to copy between the branches. */
      ecl: string
      /**
       * Include dependant components. Defaults to false.
       * @default false
       */
      includeDependencies?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptMiniComponent[], any>({
      path: `/${branch}/concepts/copy`,
      method: 'POST',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name FindClassifications
   * @summary Retrieve classifications on a branch
   * @request GET:/{branch}/classifications
   */
  findClassifications = (branch: string, params: RequestParams = {}) =>
    this.request<ItemsPageClassification, any>({
      path: `/${branch}/classifications`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name CreateClassification
   * @summary Create a classification on a branch
   * @request POST:/{branch}/classifications
   */
  createClassification = (
    branch: string,
    query?: {
      /** @default "org.semanticweb.elk.owlapi.ElkReasonerFactory" */
      reasonerId?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<string, any>({
      path: `/${branch}/classifications`,
      method: 'POST',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description Find inactive concepts with no historical association grouped by inactivation type.
   *
   * @tags Validation
   * @name FindInactiveConceptsWithNoHistoricalAssociationByInactivationType
   * @request GET:/{branch}/report/inactive-concepts-without-association
   */
  findInactiveConceptsWithNoHistoricalAssociationByInactivationType = (
    branch: string,
    query?: {
      conceptEffectiveTime?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<InactivationTypeAndConceptIdListComponent[], any>({
      path: `/${branch}/report/inactive-concepts-without-association`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Relationships
   * @name FindRelationships
   * @request GET:/{branch}/relationships
   */
  findRelationships = (
    branch: string,
    query?: {
      active?: boolean
      module?: string
      effectiveTime?: string
      source?: string
      type?: string
      destination?: string
      characteristicType?:
        | 'STATED_RELATIONSHIP'
        | 'INFERRED_RELATIONSHIP'
        | 'ADDITIONAL_RELATIONSHIP'
      /** @format int32 */
      group?: number
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
    this.request<ItemsPageRelationshipComponent, any>({
      path: `/${branch}/relationships`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Relationships
   * @name DeleteRelationships
   * @summary Batch delete relationships.
   * @request DELETE:/{branch}/relationships
   */
  deleteRelationships = (
    branch: string,
    data: RelationshipIdPojo,
    query?: {
      /**
       * Force the deletion of released relationships.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/relationships`,
      method: 'DELETE',
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Relationships
   * @name FetchRelationship
   * @request GET:/{branch}/relationships/{relationshipId}
   */
  fetchRelationship = (
    branch: string,
    relationshipId: string,
    params: RequestParams = {},
  ) =>
    this.request<RelationshipComponent, any>({
      path: `/${branch}/relationships/${relationshipId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Relationships
   * @name DeleteRelationship
   * @summary Delete a relationship.
   * @request DELETE:/{branch}/relationships/{relationshipId}
   */
  deleteRelationship = (
    branch: string,
    relationshipId: string,
    query?: {
      /**
       * Force the deletion of a released relationship.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/relationships/${relationshipId}`,
      method: 'DELETE',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Refset Members
   * @name GetMemberBulkChange
   * @summary Fetch the status of a bulk reference set member create/update job.
   * @request GET:/{branch}/members/bulk/{bulkChangeId}
   */
  getMemberBulkChange = (
    branch: string,
    bulkChangeId: string,
    params: RequestParams = {},
  ) =>
    this.request<AsyncRefsetMemberChangeBatch, any>({
      path: `/${branch}/members/bulk/${bulkChangeId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Identifiers
   * @name FindIdentifiers
   * @request GET:/{branch}/identifiers
   */
  findIdentifiers = (
    branch: string,
    query?: {
      alternateIdentifier?: string
      identifierSchemeId?: string
      activeFilter?: boolean
      isNullEffectiveTime?: boolean
      module?: string
      /** @uniqueItems true */
      referencedComponentIds?: string[]
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
      searchAfter?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageIdentifierComponent, any>({
      path: `/${branch}/identifiers`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Identifiers
   * @name FindIdentifierReferencedConcept
   * @request GET:/{branch}/identifiers/{alternateIdentifier}/referenced-concept
   */
  findIdentifierReferencedConcept = (
    branch: string,
    alternateIdentifier: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptMiniComponent, any>({
      path: `/${branch}/identifiers/${alternateIdentifier}/referenced-concept`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Descriptions
   * @name FindDescriptions
   * @request GET:/{branch}/descriptions
   */
  findDescriptions = (
    branch: string,
    query?: {
      /**
       * Set of description ids to match
       * @uniqueItems true
       */
      descriptionIds?: string[]
      /** The concept id to match */
      conceptId?: string
      /**
       * Set of concept ids to match
       * @uniqueItems true
       */
      conceptIds?: string[]
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
    this.request<ItemsPageDescriptionComponent, any>({
      path: `/${branch}/descriptions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Descriptions
   * @name FetchDescription
   * @request GET:/{branch}/descriptions/{descriptionId}
   */
  fetchDescription = (
    branch: string,
    descriptionId: string,
    params: RequestParams = {},
  ) =>
    this.request<DescriptionComponent, any>({
      path: `/${branch}/descriptions/${descriptionId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Descriptions
   * @name DeleteDescription
   * @summary Delete a description.
   * @request DELETE:/{branch}/descriptions/{descriptionId}
   */
  deleteDescription = (
    branch: string,
    descriptionId: string,
    query?: {
      /**
       * Force the deletion of a released description.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/descriptions/${descriptionId}`,
      method: 'DELETE',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Descriptions
   * @name CountSemanticTags
   * @summary List semantic tags of all active concepts together with a count of concepts using each.
   * @request GET:/{branch}/descriptions/semantictags
   */
  countSemanticTags = (branch: string, params: RequestParams = {}) =>
    this.request<Record<string, number>, any>({
      path: `/${branch}/descriptions/semantictags`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConcepts
   * @request GET:/{branch}/concepts
   */
  findConcepts = (
    branch: string,
    query?: {
      activeFilter?: boolean
      definitionStatusFilter?: string
      /**
       * Set of module ids to filter concepts by. Defaults to any.
       * @uniqueItems true
       */
      module?: number[]
      /** Search term to match against concept descriptions using a case-insensitive multi-prefix matching strategy. */
      term?: string
      termActive?: boolean
      /**
       * Set of description type ids to use for the term search. Defaults to any. Pick descendants of '900000000000446008 | Description type (core metadata concept) |'. Examples: 900000000000003001 (FSN), 900000000000013009 (Synonym), 900000000000550004 (Definition)
       * @uniqueItems true
       */
      descriptionType?: number[]
      /**
       * Set of two character language codes to match. The English language code 'en' will not be added automatically, in contrast to the Accept-Language header which always includes it. Accept-Language header still controls result FSN and PT language selection.
       * @uniqueItems true
       */
      language?: string[]
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
      ecl?: string
      /** @format int32 */
      effectiveTime?: number
      isNullEffectiveTime?: boolean
      isPublished?: boolean
      statedEcl?: string
      /** @default false */
      includeLeafFlag?: boolean
      /** @default "inferred" */
      form?: 'inferred' | 'stated' | 'additional'
      /** @uniqueItems true */
      conceptIds?: string[]
      returnIdOnly?: boolean
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
      searchAfter?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageObject<ConceptMini>, any>({
      path: `/${branch}/concepts`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConcept
   * @request GET:/{branch}/concepts/{conceptId}
   */
  findConcept = (
    branch: string,
    conceptId: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptMini, any>({
      path: `/${branch}/concepts/${conceptId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name DeleteConcept
   * @request DELETE:/{branch}/concepts/{conceptId}
   */
  deleteConcept = (
    branch: string,
    conceptId: string,
    query?: {
      /**
       * Force the deletion of a released description.
       * @default false
       */
      force?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/${branch}/concepts/${conceptId}`,
      method: 'DELETE',
      query: query,
      ...params,
    })
  /**
   * @description Pagination works on the referencing concepts. A referencing concept may have one or more references of different types.
   *
   * @tags Concepts
   * @name FindConceptReferences
   * @summary Find concepts which reference this concept in the inferred or stated form (including stated axioms).
   * @request GET:/{branch}/concepts/{conceptId}/references
   */
  findConceptReferences = (
    branch: string,
    conceptId: number,
    query?: {
      /** @default false */
      stated?: boolean
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 1000
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptReferencesResult, any>({
      path: `/${branch}/concepts/${conceptId}/references`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name GetConceptNormalForm
   * @request GET:/{branch}/concepts/{conceptId}/normal-form
   */
  getConceptNormalForm = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default false */
      statedView?: boolean
      /** @default false */
      includeTerms?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ExpressionStringPojo, any>({
      path: `/${branch}/concepts/${conceptId}/normal-form`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptInboundRelationships
   * @request GET:/{branch}/concepts/{conceptId}/inbound-relationships
   */
  findConceptInboundRelationships = (
    branch: string,
    conceptId: string,
    params: RequestParams = {},
  ) =>
    this.request<InboundRelationshipsResultComponent, any>({
      path: `/${branch}/concepts/${conceptId}/inbound-relationships`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptDescriptions
   * @request GET:/{branch}/concepts/{conceptId}/descriptions
   */
  findConceptDescriptions = (
    branch: string,
    conceptId: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptDescriptionsResultComponent, any>({
      path: `/${branch}/concepts/${conceptId}/descriptions`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name FindConceptDescendants
   * @request GET:/{branch}/concepts/{conceptId}/descendants
   */
  findConceptDescendants = (
    branch: string,
    conceptId: string,
    query?: {
      /** @default false */
      stated?: boolean
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
    this.request<ItemsPageObjectComponent, any>({
      path: `/${branch}/concepts/${conceptId}/descendants`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Concepts
   * @name GetConceptAuthoringForm
   * @request GET:/{branch}/concepts/{conceptId}/authoring-form
   */
  getConceptAuthoringForm = (
    branch: string,
    conceptId: string,
    params: RequestParams = {},
  ) =>
    this.request<Expression, any>({
      path: `/${branch}/concepts/${conceptId}/authoring-form`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name GetRelationshipChanges
   * @summary Retrieve relationship changes made by a classification run on a branch
   * @request GET:/{branch}/classifications/{classificationId}/relationship-changes
   */
  getRelationshipChanges = (
    branch: string,
    classificationId: string,
    query?: {
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 1000
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageRelationshipChange, any>({
      path:
        `/${branch}/classifications/${classificationId}/relationship-changes`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name GetEquivalentConcepts
   * @summary Retrieve equivalent concepts from a classification run on a branch
   * @request GET:/{branch}/classifications/{classificationId}/equivalent-concepts
   */
  getEquivalentConcepts = (
    branch: string,
    classificationId: string,
    query?: {
      /**
       * @format int32
       * @default 0
       */
      offset?: number
      /**
       * @format int32
       * @default 1000
       */
      limit?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageEquivalentConceptsResponse, any>({
      path:
        `/${branch}/classifications/${classificationId}/equivalent-concepts`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Classification
   * @name GetConceptPreview
   * @summary Retrieve a preview of a concept with classification changes applied
   * @request GET:/{branch}/classifications/{classificationId}/concept-preview/{conceptId}
   */
  getConceptPreview = (
    branch: string,
    classificationId: string,
    conceptId: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptViewComponent, any>({
      path:
        `/${branch}/classifications/${classificationId}/concept-preview/${conceptId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description Does not work on versioned content.
   *
   * @tags Authoring Stats
   * @name GetStats
   * @summary Calculate statistics for unreleased/unversioned content to be used in daily build browser.
   * @request GET:/{branch}/authoring-stats
   */
  getStats = (branch: string, params: RequestParams = {}) =>
    this.request<AuthoringStatsSummary, any>({
      path: `/${branch}/authoring-stats`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetReactivatedSynonyms
   * @request GET:/{branch}/authoring-stats/reactivated-synonyms
   */
  getReactivatedSynonyms = (branch: string, params: RequestParams = {}) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/reactivated-synonyms`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetReactivatedConcepts
   * @request GET:/{branch}/authoring-stats/reactivated-concepts
   */
  getReactivatedConcepts = (branch: string, params: RequestParams = {}) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/reactivated-concepts`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetNewSynonymsOnExistingConcepts
   * @request GET:/{branch}/authoring-stats/new-synonyms-on-existing-concepts
   */
  getNewSynonymsOnExistingConcepts = (
    branch: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/new-synonyms-on-existing-concepts`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetNewDescriptions
   * @request GET:/{branch}/authoring-stats/new-descriptions
   */
  getNewDescriptions = (
    branch: string,
    query?: {
      /** @default false */
      unpromotedChangesOnly?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<DescriptionMicro[], any>({
      path: `/${branch}/authoring-stats/new-descriptions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetNewConcepts
   * @request GET:/{branch}/authoring-stats/new-concepts
   */
  getNewConcepts = (
    branch: string,
    query?: {
      /** @default false */
      unpromotedChangesOnly?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/new-concepts`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetPerModuleCounts
   * @summary Get counts of various components types per module id
   * @request GET:/{branch}/authoring-stats/module-counts
   */
  getPerModuleCounts = (branch: string, params: RequestParams = {}) =>
    this.request<Record<string, Record<string, number>>, any>({
      path: `/${branch}/authoring-stats/module-counts`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetInactivatedSynonyms
   * @request GET:/{branch}/authoring-stats/inactivated-synonyms
   */
  getInactivatedSynonyms = (branch: string, params: RequestParams = {}) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/inactivated-synonyms`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetInactivatedConcepts
   * @request GET:/{branch}/authoring-stats/inactivated-concepts
   */
  getInactivatedConcepts = (branch: string, params: RequestParams = {}) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/inactivated-concepts`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Authoring Stats
   * @name GetChangedFsNs
   * @request GET:/{branch}/authoring-stats/changed-fully-specified-names
   */
  getChangedFsNs = (branch: string, params: RequestParams = {}) =>
    this.request<ConceptMicro[], any>({
      path: `/${branch}/authoring-stats/changed-fully-specified-names`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
