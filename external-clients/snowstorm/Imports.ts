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
  ImportCreationRequest,
  ImportJob,
  ImportPatchCreationRequest,
  LocalFileImportCreationRequest,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Imports<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Creates an import job ready for an archive to be uploaded. The 'internalRelease' flag is optional, it can be used to hide a version from the code system versions listing and prevent it being chosen as the code system 'latestRelease'. The 'location' response header contain the URL, including the identifier, of the new resource. Use the upload archive function next. An optional list of module IDs can be provided like ["731000124108", "900000000000012004"] to import only those modules. Leave empty or omit argument for all modules.
   *
   * @tags Import
   * @name CreateImportJob
   * @summary Create an import job.
   * @request POST:/imports
   */
  createImportJob = (data: ImportCreationRequest, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/imports`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description Uploads a SNOMED CT RF2 release archive for an import job. The import job must already exist and have a status of WAITING_FOR_FILE. PLEASE NOTE this is an asynchronous call, this function starts the import but does not wait for it to complete. Retrieve the import to check the status until it is COMPLETED or FAILED.
   *
   * @tags Import
   * @name UploadImportRf2Archive
   * @summary Upload SNOMED CT release archive.
   * @request POST:/imports/{importId}/archive
   */
  uploadImportRf2Archive = (
    importId: string,
    data: {
      /** @format binary */
      file: File
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/imports/${importId}/archive`,
      method: 'POST',
      body: data,
      type: ContentType.FormData,
      ...params,
    })
  /**
   * @description Creates and starts an import using a file on the filesystem local to the server. PLEASE NOTE this is an asynchronous call, this function starts the import but does not wait for it to complete. The 'internalRelease' flag hides a version, by default, from the code system versions listing and prevents it being chosen as the code system 'latestRelease'. The 'location' header has the identifier of the new resource. Use this to check the status of the import until it is COMPLETED or FAILED. An optional list of module IDs can be provided like ["731000124108", "900000000000012004"] to import only those modules. Leave empty or omit argument for all modules.
   *
   * @tags Import
   * @name CreateAndStartLocalFileImport
   * @summary Create and start a local file import.
   * @request POST:/imports/start-local-file-import
   */
  createAndStartLocalFileImport = (
    data: LocalFileImportCreationRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/imports/start-local-file-import`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description This endpoint is only used to support the International authoring process. Small content changes and additions gathered during the Beta Feedback process can be applied to content after it has been versioned and before the release is published. PLEASE NOTE this function does not support content deletions.
   *
   * @tags Import
   * @name CreateReleasePatchImportJob
   * @summary Apply a release patch.
   * @request POST:/imports/release-patch
   */
  createReleasePatchImportJob = (
    data: ImportPatchCreationRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/imports/release-patch`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * @description Retrieves the latest state of an import job. Used to view the import configuration and check its status.
   *
   * @tags Import
   * @name GetImportJob
   * @summary Retrieve an import job.
   * @request GET:/imports/{importId}
   */
  getImportJob = (importId: string, params: RequestParams = {}) =>
    this.request<ImportJob, any>({
      path: `/imports/${importId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
