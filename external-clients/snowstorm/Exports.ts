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
  ExportConfiguration,
  ExportRequestView,
  ReferenceSetMemberComponent,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Exports<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Create a job to export an RF2 archive. The 'location' response header contain the URL, including the identifier, of the new resource.
   *
   * @tags Export
   * @name CreateExportJob
   * @summary Create an export job.
   * @request POST:/exports
   */
  createExportJob = (data: ExportRequestView, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/exports`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Export
   * @name GetExportJob
   * @summary Retrieve an export job.
   * @request GET:/exports/{exportId}
   */
  getExportJob = (exportId: string, params: RequestParams = {}) =>
    this.request<ExportConfiguration, any>({
      path: `/exports/${exportId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * @description NOT SUPPORTED IN SWAGGER UI. Instead open the URL in a new browser tab or make a GET request another way. This endpoint can only be called once per exportId.
   *
   * @tags Export
   * @name DownloadRf2Archive
   * @summary Download the RF2 archive from an export job.
   * @request GET:/exports/{exportId}/archive
   */
  downloadRf2Archive = (exportId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/exports/${exportId}/archive`,
      method: 'GET',
      ...params,
    })
  /**
   * No description
   *
   * @tags Export
   * @name GenerateModuleDependencyPreview
   * @summary View a preview of the module dependency refset that would be generated for export
   * @request GET:/exports/module-dependency-preview
   */
  generateModuleDependencyPreview = (
    query: {
      branchPath: string
      effectiveDate: string
      /** @default true */
      isDelta?: boolean
      /** @uniqueItems true */
      modulesIncluded?: string[]
    },
    params: RequestParams = {},
  ) =>
    this.request<ReferenceSetMemberComponent[], any>({
      path: `/exports/module-dependency-preview`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
