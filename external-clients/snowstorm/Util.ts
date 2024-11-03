// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { EclString, ExpressionConstraint } from './data-contracts.ts'
import { ContentType, HttpClient, RequestParams } from './http-client.ts'

export class Util<SecurityDataType = unknown>
  extends HttpClient<SecurityDataType> {
  /**
   * @description This utility function can be used to parse Expression Constraint Language and convert to a model representation, to support ECL builder web applications. Please note that this function does not validate any concepts or terms within the expression.
   *
   * @tags Utility Functions
   * @name ParseEcl
   * @summary Parse ECL and convert to a model representation.
   * @request POST:/util/ecl-string-to-model
   */
  parseEcl = (data: string, params: RequestParams = {}) =>
    this.request<ExpressionConstraint, any>({
      path: `/util/ecl-string-to-model`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
  /**
   * @description This utility function can be used to convert an Expression Constraint Language JSON model representation to an ECL string, to support ECL builder web application. Please note that this function does not validate any concepts or terms within the expression.
   *
   * @tags Utility Functions
   * @name ParseEclModel
   * @summary Parse ECL model representation and convert it to ECL string.
   * @request POST:/util/ecl-model-to-string
   */
  parseEclModel = (data: string, params: RequestParams = {}) =>
    this.request<EclString, any>({
      path: `/util/ecl-model-to-string`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    })
}
