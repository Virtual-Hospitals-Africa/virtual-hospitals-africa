// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { HttpClient, RequestParams } from './http-client.ts'

export class ValidationMaintenance<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Reload SNOMED Drools assertions and test resources.
   *
   * @tags Validation
   * @name ReloadDrools
   * @request POST:/validation-maintenance/reload-validation-rules
   */
  reloadDrools = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/validation-maintenance/reload-validation-rules`,
      method: 'POST',
      ...params,
    })
  /**
   * @description Retrieve all semantic tags.
   *
   * @tags Validation
   * @name GetSemantictTags
   * @request GET:/validation-maintenance/semantic-tags
   */
  getSemantictTags = (
    query?: {
      /** @default "en" */
      language?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<string[], any>({
      path: `/validation-maintenance/semantic-tags`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
