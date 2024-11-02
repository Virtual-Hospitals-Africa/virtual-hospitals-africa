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
  Branch,
  BranchPojo,
  CreateBranchRequest,
  SetAuthorFlag,
  UpdateBranchRequest,
} from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Branches<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags Branching
   * @name RetrieveBranch
   * @summary Retrieve a single branch
   * @request GET:/branches/{branch}
   */
  retrieveBranch = (
    branch: string,
    query?: {
      /** @default false */
      includeInheritedMetadata?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<BranchPojo, any>({
      path: `/branches/${branch}`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name UpdateBranch
   * @summary Replace all branch metadata
   * @request PUT:/branches/{branch}
   */
  updateBranch = (
    branch: string,
    data: UpdateBranchRequest,
    params: RequestParams = {},
  ) =>
    this.request<BranchPojo, any>({
      path: `/branches/${branch}`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description The item or items in the request will be merged with the existing metadata.
   *
   * @tags Branching
   * @name UpdateBranchMetadataItems
   * @summary Upsert branch metadata
   * @request PUT:/branches/{branch}/metadata-upsert
   */
  updateBranchMetadataItems = (
    branch: string,
    data: Record<string, object>,
    params: RequestParams = {},
  ) =>
    this.request<Record<string, object>, any>({
      path: `/branches/${branch}/metadata-upsert`,
      method: 'PUT',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name RetrieveAllBranches
   * @summary Retrieve all branches
   * @request GET:/branches
   */
  retrieveAllBranches = (params: RequestParams = {}) =>
    this.request<Branch[], any>({
      path: `/branches`,
      method: 'GET',
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name CreateBranch
   * @request POST:/branches
   */
  createBranch = (data: CreateBranchRequest, params: RequestParams = {}) =>
    this.request<BranchPojo, any>({
      path: `/branches`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name UnlockBranch
   * @request POST:/branches/{branch}/actions/unlock
   */
  unlockBranch = (branch: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/branches/${branch}/actions/unlock`,
      method: 'POST',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name LockBranch
   * @request POST:/branches/{branch}/actions/lock
   */
  lockBranch = (
    branch: string,
    query: {
      lockMessage: string
    },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/branches/${branch}/actions/lock`,
      method: 'POST',
      query: query,
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name SetAuthorFlag
   * @request POST:/branches/{branchPath}/actions/set-author-flag
   */
  setAuthorFlag = (
    branchPath: string,
    data: SetAuthorFlag,
    params: RequestParams = {},
  ) =>
    this.request<BranchPojo, any>({
      path: `/branches/${branchPath}/actions/set-author-flag`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name RetrieveBranchMetadata
   * @summary Retrieve a single branch metadata
   * @request GET:/branches/{branch}/metadata
   */
  retrieveBranchMetadata = (
    branch: string,
    query?: {
      /** @default false */
      includeInheritedMetadata?: boolean
    },
    params: RequestParams = {},
  ) =>
    this.request<Record<string, object>, any>({
      path: `/branches/${branch}/metadata`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
  /**
   * No description
   *
   * @tags Branching
   * @name RetrieveBranchDescendants
   * @summary Retrieve branch descendants
   * @request GET:/branches/{branch}/children
   */
  retrieveBranchDescendants = (
    branch: string,
    query?: {
      /** @default false */
      immediateChildren?: boolean
      /**
       * @format int32
       * @default 0
       */
      page?: number
      /**
       * @format int32
       * @default 100
       */
      size?: number
    },
    params: RequestParams = {},
  ) =>
    this.request<Branch[], any>({
      path: `/branches/${branch}/children`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    })
}
