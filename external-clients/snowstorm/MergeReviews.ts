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
  Concept,
  CreateReviewRequest,
  MergeReview,
  MergeReviewConceptVersions,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class MergeReviews<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Branching
   * @name CreateMergeReview
   * @request POST:/merge-reviews
   */
  createMergeReview = (data: CreateReviewRequest, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/merge-reviews`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name SaveMergeReviewConflictingConcept
   * @request POST:/merge-reviews/{id}/{conceptId}
   */
  saveMergeReviewConflictingConcept = (
    id: string,
    conceptId: number,
    data: Concept,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/merge-reviews/${id}/${conceptId}`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name DeleteMergeReviewConflictingConcept
   * @request DELETE:/merge-reviews/{id}/{conceptId}
   */
  deleteMergeReviewConflictingConcept = (
    id: string,
    conceptId: number,
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/merge-reviews/${id}/${conceptId}`,
      method: 'DELETE',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name ApplyMergeReview
   * @request POST:/merge-reviews/{id}/apply
   */
  applyMergeReview = (id: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/merge-reviews/${id}/apply`,
      method: 'POST',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name GetMergeReview
   * @request GET:/merge-reviews/{id}
   */
  getMergeReview = (id: string, params: RequestParams = {}) =>
    this.request<MergeReview, any>({
      path: `/merge-reviews/${id}`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name GetMergeReviewConflictingConcepts
   * @request GET:/merge-reviews/{id}/details
   */
  getMergeReviewConflictingConcepts = (
    id: string,
    params: RequestParams = {},
  ) =>
    this.request<MergeReviewConceptVersions[], any>({
      path: `/merge-reviews/${id}/details`,
      method: 'GET',
      format: 'json',
      ...params,
    })
}
