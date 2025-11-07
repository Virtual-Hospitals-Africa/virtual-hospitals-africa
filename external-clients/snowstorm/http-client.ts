// deno-lint-ignore-file no-explicit-any
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { assert } from 'std/assert/assert.ts'

const SNOWSTORM_URL = Deno.env.get('SNOWSTORM_URL')
assert(
  SNOWSTORM_URL || Deno.env.get('IS_TEST') ||
    Deno.env.get('NO_EXTERNAL_CONNECT') ||
    Deno.env.get('USE_DOCKER_QUICKSTART'),
  'SNOWSTORM_URL is required on non-test environments',
)

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D
  error: E
}

type CancelToken = symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = SNOWSTORM_URL!
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abort_controllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encoded_key = encodeURIComponent(key)
    return `${encodedKey}=${
      encodeURIComponent(typeof value === 'number' ? value : `${value}`)
    }`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) =>
      'undefined' !== typeof query[key]
    )
    return keys
      .map((
        key,
      ) => (Array.isArray(query[key])
        ? this.addArrayQueryParam(query, key)
        : this.addQueryParam(query, key))
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const query_string = this.toQueryString(rawQuery)
    return query_string ? `?${query_string}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (
      input: any,
    ) => (input !== null && typeof input !== 'string'
      ? JSON.stringify(input)
      : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((form_data, key) => {
        const property = input[key]
        form_data.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        )
        return form_data
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abort_controllers.has(cancelToken)) {
      const abort_controller = this.abort_controllers.get(cancelToken)
      if (abort_controller) {
        return abort_controller.signal
      }
      return void 0
    }

    const abort_controller = new AbortController()
    this.abort_controllers.set(cancelToken, abort_controller)
    return abort_controller.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abort_controller = this.abort_controllers.get(cancelToken)

    if (abort_controller) {
      abort_controller.abort()
      this.abort_controllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secure_params =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const request_params = this.mergeRequestParams(params, secure_params)
    const query_string = query && this.toQueryString(query)
    const payload_formatter = this.contentFormatters[type || ContentType.Json]
    const response_format = format || request_params.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${
        query_string ? `?${query_string}` : ''
      }`,
      {
        ...request_params,
        headers: {
          ...(request_params.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { 'Content-Type': type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : request_params.signal) || null,
        body: typeof body === 'undefined' || body === null
          ? null
          : payload_formatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !response_format ? r : await response[response_format]()
        .then((data) => {
          if (r.ok) {
            r.data = data
          } else {
            r.error = data
          }
          return r
        })
        .catch((e) => {
          r.error = e
          return r
        })

      if (cancelToken) {
        this.abort_controllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}
