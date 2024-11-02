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
  BranchReview,
  BranchReviewConceptChanges,
  CreateReviewRequest,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Reviews<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Branching
   * @name CreateBranchReview
   * @request POST:/reviews
   */
  createBranchReview = (
    data: CreateReviewRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/reviews`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name GetBranchReview
   * @request GET:/reviews/{id}
   */
  getBranchReview = (id: string, params: RequestParams = {}) =>
    this.request<BranchReview, any>({
      path: `/reviews/${id}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name GetBranchReviewConceptChanges
   * @request GET:/reviews/{id}/concept-changes
   */
  getBranchReviewConceptChanges = (id: string, params: RequestParams = {}) =>
    this.request<BranchReviewConceptChanges, any>({
      path: `/reviews/${id}/concept-changes`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
