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
  ConceptsInForm,
  PermissionRecordComponent,
  ResponseMessage,
  UpdatedDocumentCount,
  UserGroupsPojo,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Admin<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Set which user groups have the given role on the given branch. These permissions will also apply to ancestor branches in the same code system.
   *
   * @tags Admin - Permissions
   * @name SetBranchRoleGroups
   * @summary Set branch permissions.
   * @request PUT:/admin/permissions/{branch}/role/{role}
   */
  setBranchRoleGroups = (
    branch: string,
    role: string,
    data: UserGroupsPojo,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/permissions/${branch}/role/${role}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin - Permissions
   * @name DeleteBranchRole
   * @summary Delete branch role.
   * @request DELETE:/admin/permissions/{branch}/role/{role}
   */
  deleteBranchRole = (
    branch: string,
    role: string,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/permissions/${branch}/role/${role}`,
      method: 'DELETE',
      ...params,
    })
  /**
   * @description Set which user groups have the given role globally. Global permissions apply to all branches and code systems.
   *
   * @tags Admin - Permissions
   * @name SetGlobalRoleGroups
   * @summary Set global permissions.
   * @request PUT:/admin/permissions/global/role/{role}
   */
  setGlobalRoleGroups = (
    role: string,
    data: UserGroupsPojo,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/permissions/global/role/${role}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin - Permissions
   * @name DeleteGlobalRole
   * @summary Delete a global role.
   * @request DELETE:/admin/permissions/global/role/{role}
   */
  deleteGlobalRole = (role: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/permissions/global/role/${role}`,
      method: 'DELETE',
      ...params,
    })
  /**
   * @description In an authoring terminology server; if small content changes have to be made to a code system version after it's been created the changes can be applied to the release branch and then merged back to the main code system branch using this function. This function performs the following steps: 1. The changes are merged to the parent branch at a point in time immediately after the latest version was created. 2. The version branch is rebased to this new commit. 3. A second commit is made at a point in time immediately after the fix commit to revert the changes. This is necessary to preserve the integrity of more recent commits on the code system branch made during the new ongoing authoring cycle. The fixes should be applied to head timepoint of the code system branch using an alternative method.
   *
   * @tags Admin
   * @name PromoteReleaseFix
   * @summary Promote release fix to Code System branch.
   * @request POST:/admin/{releaseFixBranch}/actions/promote-release-fix
   */
  promoteReleaseFix = (releaseFixBranch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/${releaseFixBranch}/actions/promote-release-fix`,
      method: 'POST',
      ...params,
    })
  /**
   * @description You are unlikely to need this action. If something has gone wrong when editing MRCM reference sets you can use this function to force updating the domain templates and attribute rules for all MRCM reference components.
   *
   * @tags Admin
   * @name UpdateMrcmDomainTemplatesAndAttributeRules
   * @summary Force update of MRCM domain templates and MRCM attribute rules.
   * @request POST:/admin/{branch}/actions/update-mrcm-domain-templates-and-attribute-rules
   */
  updateMrcmDomainTemplatesAndAttributeRules = (
    branch: string,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path:
        `/admin/${branch}/actions/update-mrcm-domain-templates-and-attribute-rules`,
      method: 'POST',
      ...params,
    })
  /**
   * @description You are unlikely to need this action. If something has wrong with processing content updates on the branch the definition statuses of all concepts can be updated based on the concept's axioms.
   *
   * @tags Admin
   * @name UpdateDefinitionStatuses
   * @summary Force update of definition statuses of all concepts based on axioms.
   * @request POST:/admin/{branch}/actions/update-definition-statuses
   */
  updateDefinitionStatuses = (branch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/update-definition-statuses`,
      method: 'POST',
      ...params,
    })
  /**
   * @description Fix type 'CREATE_EMPTY_2000_VERSION' creates a blank version of the root code system with effective time 20000101 which is marked as an internal release. This can be used as the dependantVersionEffectiveTime when creating code systems for loading subontologies. Fix type 'REDUNDANT_VERSIONS_REPLACED_MEMBERS' can be used to remove redundant entries in the versions-replaced map for reference set members. Redundant entries are sometimes created when a reference set member is replaced on a child branch and then the content change is reverted.
   *
   * @tags Admin
   * @name RunTechnicalFix
   * @summary Apply a technical fix.
   * @request POST:/admin/{branch}/actions/technical-fix
   */
  runTechnicalFix = (
    branch: string,
    query: {
      technicalFixType:
        | 'REDUNDANT_VERSIONS_REPLACED_MEMBERS'
        | 'CREATE_EMPTY_2000_VERSION'
    },
    params: RequestParams = {},
  ) =>
    this.request<ResponseMessage, any>({
      path: `/admin/${branch}/actions/technical-fix`,
      method: 'POST',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description Use with extreme caution! Only rollback a partial commit which you know has failed and is no longer in progress.
   *
   * @tags Admin
   * @name RollbackPartialCommit
   * @summary Rollback a partial commit on a branch.
   * @request POST:/admin/{branch}/actions/rollback-partial-commit
   */
  rollbackPartialCommit = (branch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/rollback-partial-commit`,
      method: 'POST',
      ...params,
    })
  /**
   * @description Use with caution! This operation only permits rolling back the latest commit on a branch. If there are any child branches they should be manually deleted or rebased straight after rollback. If the commit being rolled back created a code system version and release branch then they will be deleted automatically as part of rollback.
   *
   * @tags Admin
   * @name RollbackCommit
   * @summary Rollback a commit on a branch.
   * @request POST:/admin/{branch}/actions/rollback-commit
   */
  rollbackCommit = (
    branch: string,
    query: {
      /** @format int64 */
      commitHeadTime: number
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/rollback-commit`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * @description Restore the 'released' flag as well as the internal fields 'effectiveTimeI' and 'releaseHash' of all components of a concept. Makes a new commit on the specified branch. Will restore any deleted components as inactive. Looks up the code system, latest release branch and any dependant release branch automatically.
   *
   * @tags Admin
   * @name RestoreReleasedStatus
   * @summary Restore the 'released' flag and other fields of a concept.
   * @request POST:/admin/{branch}/actions/restore-released-status
   */
  restoreReleasedStatus = (
    branch: string,
    query: {
      /** @uniqueItems true */
      conceptIds: string[]
      /** @default true */
      setDeletedComponentsToInactive?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/restore-released-status`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name ReduceVersionsReplaced
   * @summary Remove any redundant entries from the versions replaced map on a branch in version control.
   * @request POST:/admin/{branch}/actions/remove-redundant-versions-replaced
   */
  reduceVersionsReplaced = (branch: string, params: RequestParams = {}) =>
    this.request<Record<string, object>, any>({
      path: `/admin/${branch}/actions/remove-redundant-versions-replaced`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * @description You are unlikely to need this action. If something has gone wrong with processing of content updates on the branch then semantic index, which supports the ECL queries, can be rebuilt on demand. Setting the dryRun to true when rebuilding the 'MAIN' branch will log a summary of the changes required without persisting the changes. This parameter can not be used on other branches. If no changes are required or dryRun is set the empty commit used to run this function will be rolled back.
   *
   * @tags Admin
   * @name RebuildBranchTransitiveClosure
   * @summary Rebuild the semantic index of the branch.
   * @request POST:/admin/{branch}/actions/rebuild-semantic-index
   */
  rebuildBranchTransitiveClosure = (
    branch: string,
    query?: {
      /** @default false */
      dryRun?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<UpdatedDocumentCount, any>({
      path: `/admin/${branch}/actions/rebuild-semantic-index`,
      method: 'POST',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name RestoreGroupNumberOfInactiveRelationships
   * @summary Restore role group number of inactive relationships.
   * @request POST:/admin/{branch}/actions/inactive-relationships-restore-group-number
   */
  restoreGroupNumberOfInactiveRelationships = (
    branch: string,
    query: {
      currentEffectiveTime: string
      previousReleaseBranch: string
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path:
        `/admin/${branch}/actions/inactive-relationships-restore-group-number`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name FindExtraConceptsInSemanticIndex
   * @summary Find concepts in the semantic index which should not be there. The concept may be inactive or deleted. To catch and debug rare cases.
   * @request POST:/admin/{branch}/actions/find-extra-concepts-in-semantic-index
   */
  findExtraConceptsInSemanticIndex = (
    branch: string,
    params: RequestParams = {},
  ) =>
    this.request<ConceptsInForm, any>({
      path: `/admin/${branch}/actions/find-extra-concepts-in-semantic-index`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name FindDuplicateAndHideParentVersion
   * @summary Hide parent version of duplicate versions of components in version control.
   * @request POST:/admin/{branch}/actions/find-duplicate-hide-parent-version
   */
  findDuplicateAndHideParentVersion = (
    branch: string,
    params: RequestParams = {},
  ) =>
    this.request<Record<string, object>, any>({
      path: `/admin/${branch}/actions/find-duplicate-hide-parent-version`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * @description You may need this action if you have used the branch merge operation to upgrade an extension which has donated content to the International Edition. The operation should be run on the extension branch.
   *
   * @tags Admin
   * @name EndDonatedContent
   * @summary End duplicate versions of donated components in version control.
   * @request POST:/admin/{branch}/actions/end-donated-content
   */
  endDonatedContent = (branch: string, params: RequestParams = {}) =>
    this.request<Record<string, object>, any>({
      path: `/admin/${branch}/actions/end-donated-content`,
      method: 'POST',
      format: 'json',
      ...params,
    })
  /**
   * @description This function will delete all inferred relationships found on the specified branch where the id is NOT in the snapshot RF2 relationship file provided. This can be useful to help clean up differences between an Alpha/Beta/Member extension release and the final release if both have been imported.
   *
   * @tags Admin
   * @name DeleteExtraInferredRelationships
   * @summary Delete inferred relationships which are NOT in the provided file.
   * @request POST:/admin/{branch}/actions/delete-extra-inferred-relationships
   */
  deleteExtraInferredRelationships = (
    branch: string,
    query: {
      /** @format int32 */
      effectiveTime: number
    },
    data: {
      /** @format binary */
      relationshipsToKeep: File
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/delete-extra-inferred-relationships`,
      method: 'POST',
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name RunContentFix
   * @request POST:/admin/{branch}/actions/content-fix
   */
  runContentFix = (
    branch: string,
    query: {
      contentFixType: 'DUPLICATE_LANGUAGE_REFERENCE_SET_ENTRIES'
      /** @uniqueItems true */
      conceptIds: number[]
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/content-fix`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name CloneChildBranch
   * @request POST:/admin/{branch}/actions/clone-child-branch
   */
  cloneChildBranch = (
    branch: string,
    query: {
      newBranch: string
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/clone-child-branch`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * @description The previous release and dependant release (if applicable) branches are considered. For inactive inferred relationships with no effectiveTime: - if they were already inactive then restore that version - if they did not previously exist then delete them
   *
   * @tags Admin
   * @name CleanInferredRelationships
   * @summary Clean newly inactive inferred relationships during authoring.
   * @request POST:/admin/{branch}/actions/clean-inferred
   */
  cleanInferredRelationships = (branch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/clean-inferred`,
      method: 'POST',
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name ClearEclCache
   * @request POST:/admin/cache/ecl/clear
   */
  clearEclCache = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/cache/ecl/clear`,
      method: 'POST',
      ...params,
    })
  /**
   * @description Used to backfill data after upgrading to Traceability Service version 3.1.x. Sends previously missing information to the Traceability Service including the commit date of all code system versions.
   *
   * @tags Admin
   * @name TraceabilityBackfill
   * @summary Backfill traceability information.
   * @request POST:/admin/actions/traceability-backfill
   */
  traceabilityBackfill = (
    query?: {
      /** @format int64 */
      sinceEpochMillisecondDate?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/actions/traceability-backfill`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * @description Use this if the search configuration for international character handling of a language has been set or updated after importing content of that language. The descriptions of the specified language will be reindexed on all branches using the new configuration. N.B. Snowstorm must be restarted to read the new configuration.
   *
   * @tags Admin
   * @name RebuildDescriptionIndexForLanguage
   * @summary Rebuild the description index.
   * @request POST:/admin/actions/rebuild-description-index-for-language
   */
  rebuildDescriptionIndexForLanguage = (
    query: {
      languageCode: string
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/admin/actions/rebuild-description-index-for-language`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * @description List all roles and user groups set at the global level and set against each branch.
   *
   * @tags Admin - Permissions
   * @name FindAll
   * @summary Retrieve all permissions
   * @request GET:/admin/permissions
   */
  findAll = (params: RequestParams = {}) =>
    this.request<PermissionRecordComponent[], any>({
      path: `/admin/permissions`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description List roles and user groups for a specific branch.
   *
   * @tags Admin - Permissions
   * @name FindForBranch
   * @summary Retrieve all permissions on given branch
   * @request GET:/admin/permissions/{branch}
   */
  findForBranch = (branch: string, params: RequestParams = {}) =>
    this.request<PermissionRecordComponent[], any>({
      path: `/admin/permissions/${branch}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description List all permissions for a user group.
   *
   * @tags Admin - Permissions
   * @name FindUserGroupPermissions
   * @summary Retrieve all permissions for a provided user group
   * @request GET:/admin/permissions/user-group/{userGroup}
   */
  findUserGroupPermissions = (userGroup: string, params: RequestParams = {}) =>
    this.request<PermissionRecordComponent[], any>({
      path: `/admin/permissions/user-group/${userGroup}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description List roles and user groups set at the global level.
   *
   * @tags Admin - Permissions
   * @name FindGlobal
   * @summary Retrieve all global permissions
   * @request GET:/admin/permissions/global
   */
  findGlobal = (params: RequestParams = {}) =>
    this.request<PermissionRecordComponent[], any>({
      path: `/admin/permissions/global`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Admin
   * @name GetEclCacheStats
   * @request GET:/admin/cache/ecl/stats
   */
  getEclCacheStats = (params: RequestParams = {}) =>
    this.request<Record<string, Record<string, number>>, any>({
      path: `/admin/cache/ecl/stats`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description This function is not usually needed but can be used to remove a branch which needs to be recreated with the same path. Everything will be wiped out including all the content (which is on the branch and has not yet been promoted to the parent branch) and the branch history (previous versions of the content in version control). This function only works on branches with no children.
   *
   * @tags Admin
   * @name HardDeleteBranch
   * @summary Hard delete a branch including its content and history.
   * @request DELETE:/admin/{branch}/actions/hard-delete
   */
  hardDeleteBranch = (branch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/admin/${branch}/actions/hard-delete`,
      method: 'DELETE',
      ...params,
    })
}
