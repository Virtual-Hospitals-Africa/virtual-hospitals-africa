// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { ExpressionConstraint } from './data-contracts.ts'
import { HttpClient, RequestParams } from './http-client.ts'

export class WebRoute<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description Swagger will attempt to follow the 302 redirection, so use developer's tools network tab to view the redirection issued.
   *
   * @tags Web Route
   * @name IssueRedirect
   * @summary Issue 302 redirection based on locally configured web routing
   * @request GET:/web-route
   */
  issueRedirect = (
    query: {
      uri: string
      _format?: string
    },
    params: RequestParams = {},
  ) =>
    this.request<ExpressionConstraint, any>({
      path: `/web-route`,
      method: 'GET',
      query: query,
      ...params,
    })
}
