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
  CodeSystem,
  CodeSystemCreate,
  CodeSystemUpdateRequest,
  CodeSystemUpgradeJob,
  CodeSystemUpgradeRequest,
  CodeSystemVersion,
  CreateCodeSystemVersionRequest,
  ItemsPageCodeSystem,
  ItemsPageCodeSystemVersion,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Codesystems<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Code Systems
   * @name FindCodeSystem
   * @summary Retrieve a code system
   * @request GET:/codesystems/{shortName}
   */
  findCodeSystem = (shortName: string, params: RequestParams = {}) =>
    this.request<CodeSystem, any>({
      path: `/codesystems/${shortName}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name UpdateCodeSystem
   * @summary Update a code system
   * @request PUT:/codesystems/{shortName}
   */
  updateCodeSystem = (
    shortName: string,
    data: CodeSystemUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CodeSystem, any>({
      path: `/codesystems/${shortName}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description This function deletes the code system and its versions but it does not delete the branches or the content.
   *
   * @tags Code Systems
   * @name DeleteCodeSystem
   * @summary Delete a code system
   * @request DELETE:/codesystems/{shortName}
   */
  deleteCodeSystem = (shortName: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}`,
      method: 'DELETE',
      ...params,
    })
  /**
   * @description This function is used to update the release package for a given version.The shortName is the code system short name e.g SNOMEDCTThe effectiveDate is the release date e.g 20210131The releasePackage is the release zip file package name. e.g SnomedCT_InternationalRF2_PRODUCTION_20210131T120000Z.zip
   *
   * @tags Code Systems
   * @name UpdateVersion
   * @summary Update the release package in an existing code system version
   * @request PUT:/codesystems/{shortName}/versions/{effectiveDate}
   */
  updateVersion = (
    shortName: string,
    effectiveDate: number,
    query: {
      releasePackage: string
    },
    params: RequestParams = {},
  ) =>
    this.request<CodeSystemVersion, any>({
      path: `/codesystems/${shortName}/versions/${effectiveDate}`,
      method: 'PUT',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description List all code systems. forBranch is an optional parameter to find the code system which the specified branch is within.
   *
   * @tags Code Systems
   * @name ListCodeSystems
   * @summary List code systems
   * @request GET:/codesystems
   */
  listCodeSystems = (
    query?: {
      forBranch?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageCodeSystem, any>({
      path: `/codesystems`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description Required fields are shortName and branch. shortName should use format SNOMEDCT-XX where XX is the country code for national extensions. dependantVersion uses effectiveTime format and can be used if the new code system depends on an older version of the parent code system, otherwise the latest version will be selected automatically. defaultLanguageCode can be used to force the sort order of the languages listed under the codesystem, otherwise these are sorted by the number of active translated terms. maintainerType has no effect on API behaviour but can be used in frontend applications for extension categorisation. defaultLanguageReferenceSet has no effect API behaviour but can be used by browsers to reflect extension preferences.
   *
   * @tags Code Systems
   * @name CreateCodeSystem
   * @summary Create a code system
   * @request POST:/codesystems
   */
  createCodeSystem = (data: CodeSystemCreate, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name FindAllVersions
   * @summary Retrieve versions of a code system
   * @request GET:/codesystems/{shortName}/versions
   */
  findAllVersions = (
    shortName: string,
    query?: {
      /** Should versions with a future effective-time be shown. */
      showFutureVersions?: boolean
      /** Should versions marked as 'internalRelease' be shown. */
      showInternalReleases?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<ItemsPageCodeSystemVersion, any>({
      path: `/codesystems/${shortName}/versions`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * @description The 'internalRelease' flag is optional, it can be used to hide a version from the code system versions listing and prevent it being chosen as the code system 'latestRelease'.
   *
   * @tags Code Systems
   * @name CreateVersion
   * @summary Create a new code system version
   * @request POST:/codesystems/{shortName}/versions
   */
  createVersion = (
    shortName: string,
    data: CreateCodeSystemVersionRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/versions`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description This operation can be used to upgrade an extension to a new version of the parent code system. If daily build is enabled for this code system that will be temporarily disabled and the daily build content will be rolled back automatically. The extension must have been imported on a branch which is a direct child of MAIN. For example: MAIN/SNOMEDCT-BE. _newDependantVersion_ uses the same format as the effectiveTime RF2 field, for example '20190731'. _contentAutomations_ should be set to false unless you are the extension maintainer and would like some automatic content changes made to support creating a new version of the extension. If you are the extension maintainer an integrity check should be run after this operation to find content that needs fixing.
   *
   * @tags Code Systems
   * @name UpgradeCodeSystem
   * @summary Upgrade code system to a different dependant version.
   * @request POST:/codesystems/{shortName}/upgrade
   */
  upgradeCodeSystem = (
    shortName: string,
    data: CodeSystemUpgradeRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/upgrade`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name StartNewAuthoringCycle
   * @summary Start new authoring cycle for given code system
   * @request POST:/codesystems/{shortName}/new-authoring-cycle
   */
  startNewAuthoringCycle = (shortName: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/new-authoring-cycle`,
      method: 'POST',
      ...params,
    })
  /**
   * @description If you have a daily build set up for a code system this operation should be used to revert/rollback the daily build content before importing any versioned content. Be sure to disable the daily build too.
   *
   * @tags Code Systems
   * @name RollbackDailyBuildContent
   * @summary Rollback daily build commits.
   * @request POST:/codesystems/{shortName}/daily-build/rollback
   */
  rollbackDailyBuildContent = (shortName: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/daily-build/rollback`,
      method: 'POST',
      ...params,
    })
  /**
   * @description The daily build import is scheduled to perform at a configured time interval per default.This operation manually triggers the scheduled daily build import service to perform.
   *
   * @tags Code Systems
   * @name TriggerScheduledImport
   * @summary Trigger scheduled daily build import.
   * @request POST:/codesystems/{shortName}/daily-build/import
   */
  triggerScheduledImport = (shortName: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/daily-build/import`,
      method: 'POST',
      ...params,
    })
  /**
   * @description Before running this the extension must be upgraded already. You must specify a task branch path (e.g MAIN/SNOMEDCT-NZ/{project}/{task}) for the delta to be created in. Set completeCopy flag to true when creating extension for the first time. It will copy all active en-gb language refset components into extension module. Set completeCopy flag to false for subsequent upgrades. Recent changes only from international release will be copied/updated in extension module. It works for both incremental monthly upgrade and roll-up upgrade (e.g every 6 months). Currently you should only run this api when upgrading SNOMEDCT-IE and SNOMEDCT-NZ
   *
   * @tags Code Systems
   * @name GenerateAdditionalLanguageRefsetDelta
   * @summary Generate additional english language refset for certain extensions (IE or NZ) by copying international en-gb language refsets into extension module
   * @request POST:/codesystems/{shortName}/additional-en-language-refset-delta
   */
  generateAdditionalLanguageRefsetDelta = (
    shortName: string,
    query: {
      branchPath: string
      /**
       * The language refset to copy from e.g 900000000000508004 | Great Britain English language reference set (foundation metadata concept)
       * @default "900000000000508004"
       */
      languageRefsetToCopyFrom?: string
      /**
       * Set completeCopy to true to copy all active components and false to copy changes only from recent international release.
       * @default false
       */
      completeCopy?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/codesystems/${shortName}/additional-en-language-refset-delta`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name UpdateDetailsFromConfig
   * @summary Update details from config. For each existing Code System the name, country code and owner are set using the values in configuration.
   * @request POST:/codesystems/update-details-from-config
   */
  updateDetailsFromConfig = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/update-details-from-config`,
      method: 'POST',
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name ClearCodeSystemInformationCache
   * @summary Clear cache of code system calculated/aggregated information.
   * @request POST:/codesystems/clear-cache
   */
  clearCodeSystemInformationCache = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/codesystems/clear-cache`,
      method: 'POST',
      ...params,
    })
  /**
   * No description
   *
   * @tags Code Systems
   * @name GetLatestDailyBuild
   * @summary Check if daily build import matches today's date.
   * @request GET:/codesystems/{shortName}/daily-build/check
   */
  getLatestDailyBuild = (shortName: string, params: RequestParams = {}) =>
    this.request<boolean, any>({
      path: `/codesystems/${shortName}/daily-build/check`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description Retrieves the state of an upgrade job. Used to view the upgrade configuration and check its status.
   *
   * @tags Code Systems
   * @name GetUpgradeJob
   * @summary Retrieve an upgrade job.
   * @request GET:/codesystems/upgrade/{jobId}
   */
  getUpgradeJob = (jobId: string, params: RequestParams = {}) =>
    this.request<CodeSystemUpgradeJob, any>({
      path: `/codesystems/upgrade/${jobId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
