// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { BuildVersion } from './data-contracts.ts'
import { HttpClient, RequestParams } from './http-client.ts'

export class Version<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Version
   * @name GetBuildInformation
   * @summary Software build version and timestamp.
   * @request GET:/version
   */
  getBuildInformation = (params: RequestParams = {}) =>
    this.request<BuildVersion, any>({
      path: `/version`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
