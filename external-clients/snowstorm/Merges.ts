// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { BranchMergeJob, MergeRequest } from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Merges<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description The integrity-check endpoint should be used before performing a promotion to avoid promotion errors.
   *
   * @tags Branching
   * @name MergeBranch
   * @summary Perform a branch rebase or promotion.
   * @request POST:/merges
   */
  mergeBranch = (data: MergeRequest, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/merges`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name RetrieveMerge
   * @request GET:/merges/{mergeId}
   */
  retrieveMerge = (mergeId: string, params: RequestParams = {}) =>
    this.request<BranchMergeJob, any>({
      path: `/merges/${mergeId}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
