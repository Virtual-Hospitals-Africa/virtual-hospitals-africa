/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ReferenceSetMemberViewComponent {
  /** @format int32 */
  releasedEffectiveTime?: number
  additionalFields?: Record<string, string>
  effectiveTime?: string
  released?: boolean
  memberId?: string
  refsetId?: string
  moduleId?: string
  referencedComponentId?: string
  active?: boolean
}

export interface ClassificationUpdateRequest {
  status?:
    | 'SCHEDULED'
    | 'RUNNING'
    | 'FAILED'
    | 'COMPLETED'
    | 'STALE'
    | 'SAVING_IN_PROGRESS'
    | 'SAVED'
    | 'SAVE_FAILED'
}

export interface CodeSystemUpdateRequest {
  name?: string
  owner?: string
  countryCode?: string
  maintainerType?: string
  defaultLanguageCode?: string
  defaultLanguageReferenceSets?: string[]
  /** @default false */
  dailyBuildAvailable?: boolean
}

export interface CodeSystem {
  name?: string
  owner?: string
  shortName: string
  /** @pattern MAIN.* */
  branchPath: string
  /** @format int32 */
  dependantVersionEffectiveTime?: number
  dailyBuildAvailable?: boolean
  latestDailyBuild?: string
  countryCode?: string
  defaultLanguageCode?: string
  defaultLanguageReferenceSets?: string[]
  maintainerType?: string
  latestVersion?: CodeSystemVersion
  languages?: Record<string, string>
  modules?: ConceptMini[]
  /** @uniqueItems true */
  userRoles?: string[]
}

export interface CodeSystemVersion {
  id?: string
  shortName?: string
  /** @format date-time */
  importDate?: string
  parentBranchPath?: string
  /** @format int32 */
  effectiveDate?: number
  version?: string
  description?: string
  releasePackage?: string
  /** @format int32 */
  dependantVersionEffectiveTime?: number
  codeSystem?: CodeSystem
  branchPath?: string
}

export interface ConceptMini {
  conceptId?: string
  active?: boolean
  definitionStatus?: string
  moduleId?: string
  effectiveTime?: string
  fsn?: TermLangPojo
  pt?: TermLangPojo
  /** @format int64 */
  descendantCount?: number
  isLeafInferred?: boolean
  isLeafStated?: boolean
  id?: string
  definitionStatusId?: string
  leafInferred?: ConceptMini
  leafStated?: ConceptMini
  extraFields?: Record<string, object>
  idAndFsnTerm?: string
}

export interface TermLangPojo {
  term?: string
  lang?: string
}

export interface AnnotationComponent {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  /**
   * @minLength 5
   * @maxLength 18
   */
  refsetId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  conceptId?: string
  referencedComponentSnomedComponent?: SnomedComponentObjectComponent
  mapTargetCoding?: CodingComponent
  annotationId?: string
  typeId?: string
  value?: string
  languageDialectCode?: string
  typePt?: TermLangPojoComponent
  effectiveTime?: string
  mapGroup?: string
  mapPriority?: string
  referencedComponent?: object
}

export interface AxiomComponent {
  axiomId?: string
  moduleId?: string
  active?: boolean
  released?: boolean
  definitionStatusId?: string
  /** @uniqueItems true */
  relationships?: RelationshipComponent[]
  definitionStatus?: string
  id?: string
  /** @format int32 */
  effectiveTime?: number
}

export interface CodingComponent {
  system?: string
  code?: string
  display?: string
}

export interface ComponentComponent {
  published?: boolean
  released?: boolean
  moduleId?: string
  id?: string
  active?: boolean
}

export interface ConceptMiniComponent {
  conceptId?: string
  active?: boolean
  definitionStatus?: string
  moduleId?: string
  effectiveTime?: string
  fsn?: TermLangPojoComponent
  pt?: TermLangPojoComponent
  /** @format int64 */
  descendantCount?: number
  isLeafInferred?: boolean
  isLeafStated?: boolean
  id?: string
  definitionStatusId?: string
  leafInferred?: ConceptMiniComponent
  leafStated?: ConceptMiniComponent
  extraFields?: Record<string, object>
  idAndFsnTerm?: string
}

export interface ConceptViewComponent {
  pt?: TermLangPojoComponent
  identifiers?: IdentifierComponent[]
  fsn?: TermLangPojoComponent
  /** @uniqueItems true */
  classAxioms?: AxiomComponent[]
  /** @uniqueItems true */
  gciAxioms?: AxiomComponent[]
  effectiveTime?: string
  /** @uniqueItems true */
  descriptions?: DescriptionComponent[]
  moduleId?: string
  /** @uniqueItems true */
  relationships?: RelationshipComponent[]
  definitionStatusId?: string
  conceptId?: string
  validationResults?: InvalidContentComponent[]
  /** @uniqueItems true */
  annotations?: AnnotationComponent[]
  active?: boolean
}

export interface ConcreteValueComponent {
  dataType?: 'DECIMAL' | 'INTEGER' | 'STRING'
  value?: string
  valueWithPrefix?: string
}

export interface DescriptionComponent {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  /**
   * @minLength 5
   * @maxLength 18
   */
  descriptionId?: string
  term: string
  termFolded?: string
  /** @format int32 */
  termLen?: number
  tag?: string
  conceptId?: string
  /**
   * @minLength 2
   * @maxLength 2
   */
  languageCode: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  typeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  caseSignificanceId: string
  acceptabilityMap?: Record<string, string>
  lang?: string
  inactivationIndicator?: string
  associationTargets?: Record<string, string[]>
  languageRefsetMembers?: DescriptionComponent
  acceptabilityMapFromLangRefsetMembers?: Record<string, string>
  caseSignificance?: string
  type?: string
  effectiveTime?: string
}

export interface IdentifierComponent {
  alternateIdentifier: string
  effectiveTime?: string
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  identifierSchemeId: string
  identifierScheme?: ConceptMiniComponent
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  released?: boolean
  /** @format int32 */
  releasedEffectiveTime?: number
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  /** @format int32 */
  effectiveTimeI?: number
  releaseHash?: string
  referencedComponentSnomedComponent?: SnomedComponentObjectComponent
  referencedComponent?: object
  id?: string
}

export interface InvalidContentComponent {
  ruleId?: string
  conceptId?: string
  conceptFsn?: string
  component?: ComponentComponent
  message?: string
  severity?: 'ERROR' | 'WARNING'
  ignorePublishedCheck?: boolean
  published?: boolean
  componentId?: string
}

export interface RelationshipComponent {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  relationshipId?: string
  sourceId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  destinationId?: string
  concreteValue?: ConcreteValueComponent
  /** @format int32 */
  relationshipGroup?: number
  /**
   * @minLength 5
   * @maxLength 18
   */
  typeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  characteristicTypeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  modifierId: string
  source?: ConceptMiniComponent
  type?: ConceptMiniComponent
  target?: ConceptMiniComponent
  grouped?: boolean
  inferred?: boolean
  characteristicType?: string
  /** @format int64 */
  relationshipIdAsLong?: number
  modifier?: string
  /** @format int32 */
  groupId?: number
  concrete?: boolean
  effectiveTime?: string
  id?: string
}

export interface SnomedComponentObjectComponent {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  effectiveTime?: string
  id?: string
}

export interface TermLangPojoComponent {
  term?: string
  lang?: string
}

export interface UpdateBranchRequest {
  metadata?: Record<string, object>
}

export interface BranchPojo {
  path?: string
  state?: 'UP_TO_DATE' | 'FORWARD' | 'BEHIND' | 'DIVERGED'
  containsContent?: boolean
  locked?: boolean
  /** @format date-time */
  creation?: string
  /** @format date-time */
  base?: string
  /** @format date-time */
  head?: string
  /** @format int64 */
  creationTimestamp?: number
  /** @format int64 */
  baseTimestamp?: number
  /** @format int64 */
  headTimestamp?: number
  /** @uniqueItems true */
  userRoles?: string[]
  /** @uniqueItems true */
  globalUserRoles?: string[]
  versionsReplacedCounts?: Record<string, number>
  metadata?: Record<string, object>
  versionsReplaced?: Record<string, string[]>
}

export interface UserGroupsPojo {
  /** @uniqueItems true */
  userGroups?: string[]
}

export interface IntegrityIssueReport {
  axiomsWithMissingOrInactiveReferencedConcept?: Record<string, ConceptMini>
  relationshipsWithMissingOrInactiveSource?: Record<string, number>
  relationshipsWithMissingOrInactiveType?: Record<string, number>
  relationshipsWithMissingOrInactiveDestination?: Record<string, number>
  empty?: boolean
}

export interface MemberSearchRequestComponent {
  active?: boolean
  referenceSet?: string
  module?: string
  referencedComponentIds?: object[]
  owlExpressionConceptId?: string
  owlExpressionGCI?: boolean
  additionalFields?: Record<string, string>
  additionalFieldSets?: Record<string, string[]>
  includeNonSnomedMapTerms?: boolean
  nullEffectiveTime?: boolean
}

export interface ItemsPageReferenceSetMemberComponent {
  items?: ReferenceSetMemberComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ReferenceSetMemberComponent {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  memberId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  refsetId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  conceptId?: string
  additionalFields?: Record<string, string>
  referencedComponentSnomedComponent?: SnomedComponentObjectComponent
  mapTargetCoding?: CodingComponent
  mapGroup?: string
  mapPriority?: string
  referencedComponent?: object
  effectiveTime?: string
}

export interface CreatePostCoordinatedExpressionRequest {
  moduleId?: string
  closeToUserForm?: string
}

export interface PostCoordinatedExpression {
  id?: string
  closeToUserForm?: string
  classifiableForm?: string
  humanReadableClassifiableForm?: string
}

export interface ConceptSearchRequest {
  termFilter?: string
  termActive?: boolean
  activeFilter?: boolean
  /** @uniqueItems true */
  descriptionType?: number[]
  /** @uniqueItems true */
  language?: string[]
  /** @uniqueItems true */
  preferredIn?: number[]
  /** @uniqueItems true */
  acceptableIn?: number[]
  /** @uniqueItems true */
  preferredOrAcceptableIn?: number[]
  definitionStatusFilter?: string
  /** @uniqueItems true */
  module?: number[]
  includeLeafFlag?: boolean
  form?: 'inferred' | 'stated' | 'additional'
  eclFilter?: string
  /** @format int32 */
  effectiveTime?: number
  nullEffectiveTime?: boolean
  published?: boolean
  statedEclFilter?: string
  /** @uniqueItems true */
  conceptIds?: string[]
  returnIdOnly?: boolean
  /** @format int32 */
  offset?: number
  /** @format int32 */
  limit?: number
  searchAfter?: string
}

export type ItemsPageObject<T> = {
  items?: T[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export type ExpressionConstraint = object

export interface EclString {
  eclString?: string
}

export interface CreateReviewRequest {
  source: string
  target: string
}

export interface MultibranchDescriptionSearchRequestComponent {
  /** @uniqueItems true */
  branches?: string[]
}

export interface BrowserDescriptionSearchResultComponent {
  term?: string
  active?: boolean
  languageCode?: string
  module?: string
  concept?: ConceptMiniComponent
}

export interface ItemsPageBrowserDescriptionSearchResultComponent {
  items?: BrowserDescriptionSearchResultComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface MergeRequest {
  source?: string
  target?: string
  commitComment?: string
  reviewId?: string
}

export interface Annotation {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  memberId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  refsetId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  conceptId?: string
  additionalFields?: Record<string, string>
  referencedComponentSnomedComponent?: SnomedComponentObject
  mapTargetCoding?: Coding
  annotationId?: string
  typeId?: string
  value?: string
  languageDialectCode?: string
  typePt?: TermLangPojo
  effectiveTime?: string
  mapGroup?: string
  mapPriority?: string
  referencedComponent?: object
}

export interface Axiom {
  axiomId?: string
  moduleId?: string
  active?: boolean
  released?: boolean
  definitionStatusId?: string
  /** @uniqueItems true */
  relationships?: Relationship[]
  definitionStatus?: string
  id?: string
  /** @format int32 */
  effectiveTime?: number
}

export interface Coding {
  system?: string
  code?: string
  display?: string
}

export interface Component {
  published?: boolean
  released?: boolean
  moduleId?: string
  id?: string
  active?: boolean
}

/** The concept to validate */
export interface Concept {
  /**
   * @minLength 5
   * @maxLength 18
   */
  conceptId?: string
  /** @format int64 */
  descendantCount?: number
  fsn?: TermLangPojo
  pt?: TermLangPojo
  active?: boolean
  effectiveTime?: string
  released?: boolean
  /** @format int32 */
  releasedEffectiveTime?: number
  inactivationIndicator?: string
  associationTargets?: Record<string, string[]>
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  definitionStatus?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  definitionStatusId: string
  /** @uniqueItems true */
  descriptions?: Description[]
  /** @uniqueItems true */
  annotations?: Annotation[]
  /** @uniqueItems true */
  classAxioms?: Axiom[]
  /** @uniqueItems true */
  gciAxioms?: Axiom[]
  /** @uniqueItems true */
  relationships?: Relationship[]
  alternateIdentifiers?: Identifier[]
  validationResults?: InvalidContent[]
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  /** @format int32 */
  effectiveTimeI?: number
  releaseHash?: string
  activeInferredRelationships?: Relationship[]
  /** @uniqueItems true */
  allOwlAxiomMembers?: ReferenceSetMember[]
  /** @uniqueItems true */
  allAnnotationMembers?: ReferenceSetMember[]
  activeDescriptions?: Description[]
  primitive?: boolean
}

export interface ConcreteValue {
  dataType?: 'DECIMAL' | 'INTEGER' | 'STRING'
  value?: string
  valueWithPrefix?: string
}

export interface Description {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  /**
   * @minLength 5
   * @maxLength 18
   */
  descriptionId?: string
  term: string
  termFolded?: string
  /** @format int32 */
  termLen?: number
  tag?: string
  conceptId?: string
  /**
   * @minLength 2
   * @maxLength 2
   */
  languageCode: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  typeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  caseSignificanceId: string
  acceptabilityMap?: Record<string, string>
  lang?: string
  inactivationIndicator?: string
  associationTargets?: Record<string, string[]>
  languageRefsetMembers?: Description
  acceptabilityMapFromLangRefsetMembers?: Record<string, string>
  caseSignificance?: string
  type?: string
  effectiveTime?: string
}

export interface Identifier {
  alternateIdentifier: string
  effectiveTime?: string
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  identifierSchemeId: string
  identifierScheme?: ConceptMini
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  released?: boolean
  /** @format int32 */
  releasedEffectiveTime?: number
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  /** @format int32 */
  effectiveTimeI?: number
  releaseHash?: string
  referencedComponentSnomedComponent?: SnomedComponentObject
  referencedComponent?: object
  id?: string
}

export interface InvalidContent {
  ruleId?: string
  conceptId?: string
  conceptFsn?: string
  component?: Component
  message?: string
  severity?: 'ERROR' | 'WARNING'
  ignorePublishedCheck?: boolean
  published?: boolean
  componentId?: string
}

export interface ReferenceSetMember {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  memberId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  refsetId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  referencedComponentId: string
  conceptId?: string
  additionalFields?: Record<string, string>
  referencedComponentSnomedComponent?: SnomedComponentObject
  mapTargetCoding?: Coding
  mapGroup?: string
  mapPriority?: string
  referencedComponent?: object
  effectiveTime?: string
}

export interface Relationship {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  relationshipId?: string
  sourceId?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  destinationId?: string
  concreteValue?: ConcreteValue
  /** @format int32 */
  relationshipGroup?: number
  /**
   * @minLength 5
   * @maxLength 18
   */
  typeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  characteristicTypeId: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  modifierId: string
  source?: ConceptMini
  type?: ConceptMini
  target?: ConceptMini
  grouped?: boolean
  inferred?: boolean
  characteristicType?: string
  /** @format int64 */
  relationshipIdAsLong?: number
  modifier?: string
  /** @format int32 */
  groupId?: number
  concrete?: boolean
  effectiveTime?: string
  id?: string
}

export interface SnomedComponentObject {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  active?: boolean
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  /** @format int32 */
  effectiveTimeI?: number
  released?: boolean
  releaseHash?: string
  /** @format int32 */
  releasedEffectiveTime?: number
  effectiveTime?: string
  id?: string
}

export interface ImportCreationRequest {
  type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
  /** @example "MAIN" */
  branchPath: string
  /** @default false */
  createCodeSystemVersion?: boolean
  /** @default false */
  internalRelease?: boolean
  /** @default [] */
  filterModuleIds?: string[]
}

export interface LocalFileImportCreationRequest {
  type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
  /** @example "MAIN" */
  branchPath: string
  /** @default false */
  createCodeSystemVersion?: boolean
  /** @default false */
  internalRelease?: boolean
  /** @default [] */
  filterModuleIds?: string[]
  filePath?: string
}

export interface ImportPatchCreationRequest {
  type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
  branchPath?: string
  /** @format int32 */
  patchReleaseVersion?: number
}

export interface ExportRequestView {
  id?: string
  /** @format date-time */
  startDate?: string
  branchPath: string
  /** @default "DELTA" */
  type: 'DELTA' | 'SNAPSHOT' | 'FULL'
  /** @pattern [0-9]{8} */
  filenameEffectiveDate?: string
  /** @default false */
  conceptsAndRelationshipsOnly?: boolean
  /** @default false */
  unpromotedChangesOnly?: boolean
  /** @default false */
  legacyZipNaming?: boolean
  /**
   * Format: yyyymmdd. Add a transient effectiveTime to rows of content which are not yet versioned.
   * @pattern [0-9]{8}
   */
  transientEffectiveTime?: string
  /**
   * Format: yyyymmdd. Can be used to produce a delta after content is versioned by filtering a SNAPSHOT export by effectiveTime.
   * @pattern [0-9]{8}
   */
  startEffectiveTime?: string
  /** @uniqueItems true */
  moduleIds?: string[]
  /**
   * If refsetIds are included, this indicates that the export will be a refset-only export.
   * @uniqueItems true
   */
  refsetIds?: string[]
  /** @default "PENDING" */
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'DOWNLOADED' | 'FAILED'
  exportFilePath?: string
  /** @default false */
  startExport?: boolean
}

export interface CodeSystemCreate {
  countryCode?: string
  maintainerType?: string
  defaultLanguageCode?: string
  /** @format int32 */
  dependantVersionEffectiveTime?: number
  branchPath?: string
  shortName?: string
  defaultLanguageReferenceSets?: string[]
  name?: string
  owner?: string
}

export interface CreateCodeSystemVersionRequest {
  /** @format int32 */
  effectiveDate?: number
  description?: string
  /** @default false */
  internalRelease?: boolean
}

export interface CodeSystemUpgradeRequest {
  /** @format int32 */
  newDependantVersion?: number
  contentAutomations?: boolean
}

export interface ConceptView {
  pt?: TermLangPojo
  identifiers?: Identifier[]
  fsn?: TermLangPojo
  /** @uniqueItems true */
  classAxioms?: Axiom[]
  /** @uniqueItems true */
  gciAxioms?: Axiom[]
  effectiveTime?: string
  /** @uniqueItems true */
  descriptions?: Description[]
  moduleId?: string
  /** @uniqueItems true */
  relationships?: Relationship[]
  definitionStatusId?: string
  conceptId?: string
  validationResults?: InvalidContent[]
  /** @uniqueItems true */
  annotations?: Annotation[]
  active?: boolean
}

export type BodyBuilder = object

export interface ConceptBulkLoadRequestComponent {
  conceptIds?: string[]
  /** @uniqueItems true */
  descriptionIds?: string[]
}

export interface ConceptComponent {
  /**
   * @minLength 5
   * @maxLength 18
   */
  conceptId?: string
  /** @format int64 */
  descendantCount?: number
  fsn?: TermLangPojoComponent
  pt?: TermLangPojoComponent
  active?: boolean
  effectiveTime?: string
  released?: boolean
  /** @format int32 */
  releasedEffectiveTime?: number
  inactivationIndicator?: string
  associationTargets?: Record<string, string[]>
  /**
   * @minLength 5
   * @maxLength 18
   */
  moduleId?: string
  definitionStatus?: string
  /**
   * @minLength 5
   * @maxLength 18
   */
  definitionStatusId: string
  /** @uniqueItems true */
  descriptions?: DescriptionComponent[]
  /** @uniqueItems true */
  annotations?: AnnotationComponent[]
  /** @uniqueItems true */
  classAxioms?: AxiomComponent[]
  /** @uniqueItems true */
  gciAxioms?: AxiomComponent[]
  /** @uniqueItems true */
  relationships?: RelationshipComponent[]
  alternateIdentifiers?: IdentifierComponent[]
  validationResults?: InvalidContentComponent[]
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  changed?: boolean
  /** @format int32 */
  effectiveTimeI?: number
  releaseHash?: string
  activeInferredRelationships?: RelationshipComponent[]
  /** @uniqueItems true */
  allOwlAxiomMembers?: ReferenceSetMemberComponent[]
  /** @uniqueItems true */
  allAnnotationMembers?: ReferenceSetMemberComponent[]
  activeDescriptions?: DescriptionComponent[]
  primitive?: boolean
}

export interface CreateBranchRequest {
  parent?: string
  name?: string
  metadata?: Record<string, object>
}

export interface SetAuthorFlag {
  name?: string
  value?: boolean
}

export interface ResponseMessage {
  message?: string
}

export interface UpdatedDocumentCount {
  updateCount?: Record<string, number>
}

export interface ConceptsInForm {
  statedConceptIds?: number[]
  inferredConceptIds?: number[]
}

export interface InactivationTypeAndConceptIdListComponent {
  inactivationIndicator?: ConceptMiniComponent
  conceptIds?: number[]
}

export interface ItemsPageRelationshipComponent {
  items?: RelationshipComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface AsyncRefsetMemberChangeBatch {
  id?: string
  /** @format date-time */
  startTime?: string
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  memberIds?: string[]
  /** @format date-time */
  endTime?: string
  message?: string
  /** @format float */
  secondsDuration?: number
}

export interface ItemsPageIdentifierComponent {
  items?: IdentifierComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ItemsPageDescriptionComponent {
  items?: DescriptionComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ConceptReferencesResult {
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  referencesByType?: TypeReferences[]
}

export interface TypeReferences {
  referenceType?: ConceptMini
  referencingConcepts?: ConceptMini[]
}

export interface ExpressionStringPojo {
  expression?: string
}

export interface InboundRelationshipsResultComponent {
  inboundRelationships?: RelationshipComponent[]
  /** @format int32 */
  total?: number
}

export interface ConceptDescriptionsResultComponent {
  /** @uniqueItems true */
  conceptDescriptions?: DescriptionComponent[]
}

export interface ItemsPageObjectComponent {
  items?: object[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ConceptMicro {
  id?: string
  primitive?: boolean
  term?: string
}

export interface Expression {
  attributes?: ExpressionAttribute[]
  concepts?: ConceptMicro[]
  groups?: ExpressionGroup[]
}

export interface ExpressionAttribute {
  type?: ConceptMicro
  target?: ConceptMicro
  value?: ConcreteValue
  concrete?: boolean
}

export interface ExpressionGroup {
  attributes?: ExpressionAttribute[]
}

export interface Classification {
  id?: string
  path?: string
  status?:
    | 'SCHEDULED'
    | 'RUNNING'
    | 'FAILED'
    | 'COMPLETED'
    | 'STALE'
    | 'SAVING_IN_PROGRESS'
    | 'SAVED'
    | 'SAVE_FAILED'
  errorMessage?: string
  reasonerId?: string
  userId?: string
  /** @format date-time */
  creationDate?: string
  /** @format date-time */
  completionDate?: string
  /** @format date-time */
  lastCommitDate?: string
  /** @format date-time */
  saveDate?: string
  inferredRelationshipChangesFound?: boolean
  redundantStatedRelationshipsFound?: boolean
  equivalentConceptsFound?: boolean
}

export interface ItemsPageClassification {
  items?: Classification[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ItemsPageRelationshipChange {
  items?: RelationshipChange[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface RelationshipChange {
  internalId?: string
  classificationId?: string
  relationshipId?: string
  active?: boolean
  sourceId?: string
  destinationId?: string
  value?: string
  /** @format int32 */
  group?: number
  typeId?: string
  modifierId?: string
  inferredNotStated?: boolean
  source?: ConceptMini
  destination?: ConceptMini
  type?: ConceptMini
  sourceFsn?: string
  typeFsn?: string
  destinationFsn?: string
  /** @format int32 */
  unionGroup?: number
  destinationOrValue?: string
  characteristicTypeId?: string
  changeNature?: 'INFERRED' | 'REDUNDANT'
  destinationOrValueWithoutPrefix?: string
  destinationOrRawValue?: object
  concrete?: boolean
}

export interface EquivalentConceptsResponse {
  equivalentConcepts?: ItemsPageConceptMini
}

export interface ItemsPageConceptMini {
  items?: ConceptMini[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ItemsPageEquivalentConceptsResponse {
  items?: EquivalentConceptsResponse[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface AuthoringStatsSummary {
  /** @format int64 */
  newConceptsCount?: number
  /** @format int64 */
  inactivatedConceptsCount?: number
  /** @format int64 */
  reactivatedConceptsCount?: number
  /** @format int64 */
  changedFsnCount?: number
  /** @format int64 */
  inactivatedSynonymsCount?: number
  /** @format int64 */
  newSynonymsForExistingConceptsCount?: number
  /** @format int64 */
  reactivatedSynonymsCount?: number
  /** @format date-time */
  executionTime?: string
  title?: string
}

export interface DescriptionMicro {
  id?: string
  conceptId?: string
  term?: string
}

export interface BuildVersion {
  version?: string
  time?: string
}

export interface BranchReview {
  id: string
  /** @format date-time */
  lastUpdated?: string
  status?: 'PENDING' | 'CURRENT' | 'STALE' | 'FAILED'
  source?: BranchState
  target?: BranchState
  /** @uniqueItems true */
  changedConcepts?: number[]
  sourceParent?: boolean
}

export interface BranchState {
  path?: string
  /** @format int64 */
  baseTimestamp?: number
  /** @format int64 */
  headTimestamp?: number
}

export interface BranchReviewConceptChanges {
  /** @uniqueItems true */
  changedConcepts?: number[]
}

export interface PageBrowserDescriptionSearchResultComponent {
  /** @format int32 */
  totalPages?: number
  /** @format int64 */
  totalElements?: number
  pageable?: PageableObjectComponent
  /** @format int32 */
  numberOfElements?: number
  /** @format int32 */
  size?: number
  content?: BrowserDescriptionSearchResultComponent[]
  /** @format int32 */
  number?: number
  sort?: SortObject[]
  first?: boolean
  last?: boolean
  empty?: boolean
}

export interface PageableObjectComponent {
  paged?: boolean
  unpaged?: boolean
  /** @format int32 */
  pageNumber?: number
  /** @format int32 */
  pageSize?: number
  /** @format int64 */
  offset?: number
  sort?: SortObject[]
}

export interface SortObject {
  direction?: string
  nullHandling?: string
  ascending?: boolean
  property?: string
  ignoreCase?: boolean
}

export interface ItemsPageConceptMiniComponent {
  items?: ConceptMiniComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ApiError {
  message?: string
  developerMessage?: string
  additionalInfo?: Record<string, object>
}

export interface BranchMergeJob {
  id?: string
  source?: string
  target?: string
  /** @format date-time */
  scheduledDate?: string
  /** @format date-time */
  startDate?: string
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CONFLICTS'
  /** @format date-time */
  endDate?: string
  message?: string
  apiError?: ApiError
}

export interface MergeReview {
  id?: string
  sourcePath?: string
  targetPath?: string
  sourceToTargetReviewId?: string
  targetToSourceReviewId?: string
  status?: 'PENDING' | 'CURRENT' | 'STALE' | 'FAILED'
  message?: string
  /** @format date-time */
  created?: string
}

export interface MergeReviewConceptVersions {
  /** The concept to validate */
  sourceConcept?: Concept
  /** The concept to validate */
  targetConcept?: Concept
  /** The concept to validate */
  autoMergedConcept?: Concept
  /** The concept to validate */
  manuallyMergedConcept?: Concept
  targetConceptVersionBehind?: boolean
}

export interface ImportJob {
  status?: 'WAITING_FOR_FILE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  errorMessage?: string
  branchPath?: string
  createCodeSystemVersion?: boolean
  /** @format int32 */
  patchReleaseVersion?: number
  /** @uniqueItems true */
  moduleIds?: string[]
  internalRelease?: boolean
  type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
}

export interface ExportConfiguration {
  id?: string
  /** @format date-time */
  startDate?: string
  branchPath: string
  /** @default "DELTA" */
  type: 'DELTA' | 'SNAPSHOT' | 'FULL'
  /** @pattern [0-9]{8} */
  filenameEffectiveDate?: string
  /** @default false */
  conceptsAndRelationshipsOnly?: boolean
  /** @default false */
  unpromotedChangesOnly?: boolean
  /** @default false */
  legacyZipNaming?: boolean
  /**
   * Format: yyyymmdd. Add a transient effectiveTime to rows of content which are not yet versioned.
   * @pattern [0-9]{8}
   */
  transientEffectiveTime?: string
  /**
   * Format: yyyymmdd. Can be used to produce a delta after content is versioned by filtering a SNAPSHOT export by effectiveTime.
   * @pattern [0-9]{8}
   */
  startEffectiveTime?: string
  /** @uniqueItems true */
  moduleIds?: string[]
  /**
   * If refsetIds are included, this indicates that the export will be a refset-only export.
   * @uniqueItems true
   */
  refsetIds?: string[]
  /** @default "PENDING" */
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'DOWNLOADED' | 'FAILED'
  exportFilePath?: string
  /** @default false */
  startExport?: boolean
}

export interface ItemsPageCodeSystem {
  items?: CodeSystem[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ItemsPageCodeSystemVersion {
  items?: CodeSystemVersion[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface CodeSystemUpgradeJob {
  /** @format int32 */
  newDependantVersion?: number
  codeSystemShortname?: string
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  errorMessage?: string
  /** @format int64 */
  creationTimestamp?: number
}

export interface PageableObject {
  paged?: boolean
  unpaged?: boolean
  /** @format int32 */
  pageNumber?: number
  /** @format int32 */
  pageSize?: number
  /** @format int64 */
  offset?: number
  sort?: SortObject[]
}

export interface RefSetMemberPageWithBucketAggregationsReferenceSetMember {
  content?: ReferenceSetMember[]
  pageable?: PageableObject
  memberCountsByReferenceSet?: Record<string, number>
  referenceSets?: Record<string, ConceptMini>
  searchAfterArray?: object[]
  searchAfter?: string
  /** @format int32 */
  totalPages?: number
  /** @format int64 */
  totalElements?: number
  last?: boolean
  /** @format int32 */
  numberOfElements?: number
  /** @format int32 */
  size?: number
  /** @format int32 */
  number?: number
  sort?: SortObject[]
  first?: boolean
  empty?: boolean
}

export interface ItemsPageConceptComponent {
  items?: ConceptComponent[]
  /** @format int64 */
  total?: number
  /** @format int64 */
  limit?: number
  /** @format int64 */
  offset?: number
  searchAfter?: string
  searchAfterArray?: object[]
}

export interface ConceptHistory {
  conceptId?: string
  history?: ConceptHistoryItem[]
}

export interface ConceptHistoryItem {
  effectiveTime?: string
  branch?: string
  /** @uniqueItems true */
  componentTypes?: ('Concept' | 'Description' | 'Relationship' | 'Axiom')[]
}

export interface AsyncConceptChangeBatch {
  id?: string
  /** @format date-time */
  startTime?: string
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  conceptIds?: number[]
  /** @format date-time */
  endTime?: string
  message?: string
  /** @format float */
  secondsDuration?: number
}

export interface Branch {
  internalId?: string
  path?: string
  /** @format date-time */
  start?: string
  /** @format date-time */
  end?: string
  deleted?: boolean
  /** @format date-time */
  base?: string
  /** @format date-time */
  head?: string
  /** @format date-time */
  creation?: string
  /** @format date-time */
  lastPromotion?: string
  locked?: boolean
  containsContent?: boolean
  versionsReplaced?: Record<string, string[]>
  metadataInternal?: Record<string, string>
  metadata?: Metadata
  state?: 'UP_TO_DATE' | 'FORWARD' | 'BEHIND' | 'DIVERGED'
  /** @format int64 */
  creationTimestamp?: number
  /** @format int64 */
  headTimestamp?: number
  /** @format int64 */
  baseTimestamp?: number
  versionsReplacedCounts?: Record<string, number>
}

export interface Metadata {
  asMap?: Record<string, object>
}

export interface PermissionRecordComponent {
  role?: string
  path?: string
  global?: boolean
  /** @uniqueItems true */
  userGroups?: string[]
}

export interface RelationshipIdPojo {
  /** @uniqueItems true */
  relationshipIds?: string[]
}

export interface MemberIdsPojoComponent {
  /** @uniqueItems true */
  memberIds?: string[]
}
