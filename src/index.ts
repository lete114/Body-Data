import type { IncomingMessage } from 'node:http'
import type { IBodyOptions, IOptions } from './type'

export * from './type'

/**
 * Converts a Node.js IncomingMessage to a Web standard Request object.
 * This enables unified handling of HTTP requests across Node.js (18+), Deno, Bun, Cloudflare Workers, and browsers.
 *
 * @param {IncomingMessage | Request} req - The Node.js IncomingMessage or a Web standard Request object.
 * @returns {Request} A Web standard Request object.
 */
export function toWebRequest(req: IncomingMessage | Request): Request {
  if (typeof Request !== 'undefined' && req instanceof Request) {
    return req
  }
  const nodeReq = req as IncomingMessage
  const { method, url, headers } = nodeReq
  const fullUrl = url?.startsWith('http') ? url : `http://localhost${url}`
  const body = method === 'GET' || method === 'HEAD' ? undefined : (nodeReq as any)
  const requestInit: RequestInit & { duplex: 'half' } = {
    method,
    headers: Object.fromEntries(Object.entries(headers)) as Record<string, string>,
    body,
    duplex: 'half',
  }
  return new Request(fullUrl, requestInit)
}

/**
 * Extracts both query parameters and request body data from an HTTP request.
 * Supports both Node.js IncomingMessage and Web standard Request objects.
 *
 * @param {IncomingMessage | Request} req - The HTTP request object (Node.js or Web standard).
 * @param {IOptions} [options] - Optional settings for parsing the request body.
 * @returns {Promise<{ params: Record<string, any>; body: Record<string, any> }>} An object containing `params` and `body`.
 */
export async function bodyData<P extends Record<string, any>, B extends Record<string, any>>(
  req: IncomingMessage | Request,
  options: IOptions = {},
): Promise<{ params: P, body: B }> {
  const webReq = toWebRequest(req)
  return {
    params: getParams<P>(webReq),
    body: await getBody<B>(webReq, options),
  }
}

/**
 * Extracts query parameters from a GET or URL-based request.
 * Supports both Node.js IncomingMessage and Web standard Request objects.
 *
 * @param {IncomingMessage | Request} req - The HTTP request object (Node.js or Web standard).
 * @returns {T} A key-value map of the URL query parameters.
 */
export function getParams<T extends Record<string, any>>(
  req: IncomingMessage | Request,
): T {
  const webReq = toWebRequest(req)
  const urlStr = webReq.url
  const { searchParams } = new URL(urlStr)
  return Object.fromEntries(searchParams) as T
}

/**
 * Extracts and parses the request body from a POST/PUT request.
 * Supports both Node.js IncomingMessage and Web standard Request objects.
 *
 * @param {IncomingMessage | Request} req - The HTTP request object (Node.js or Web standard).
 * @param {IBodyOptions} [options] - Options to control body parsing behavior.
 * @returns {Promise<T>} Parsed body data, or raw string if `raw` is enabled or unsupported content-type.
 *
 * Supports:
 * - `application/json`
 * - `application/x-www-form-urlencoded`
 * - `text/plain`
 * - `multipart/form-data` (returns raw body string)
 */
export async function getBody<T extends Record<string, any>>(
  req: IncomingMessage | Request,
  options: IBodyOptions = {},
): Promise<T> {
  const webReq = toWebRequest(req)
  try {
    const ab = await webReq.arrayBuffer()
    const encoding = options.encoding || 'utf-8'
    const buffer = new (typeof TextDecoder !== 'undefined' ? TextDecoder : (globalThis as any).TextDecoder)(encoding).decode(ab)
    if (!buffer) {
      return {} as unknown as T
    }
    if (options.raw) {
      return { raw: buffer } as unknown as T
    }

    const contentType = options.contentType || webReq.headers.get('content-type') || options.backContentType || ''
    if (contentType.startsWith('application/json')) {
      return JSON.parse(buffer) as T
    }
    if (contentType.startsWith('application/x-www-form-urlencoded')) {
      return Object.fromEntries(new URLSearchParams(buffer)) as T
    }
    if (contentType.startsWith('text/plain')) {
      return { text: buffer } as unknown as T
    }
    if (contentType.startsWith('multipart/form-data')) {
      return { raw: buffer } as unknown as T
    }
    return { raw: buffer } as unknown as T
  }
  catch (err) {
    if (options.onError) {
      options.onError(err as Error)
    }
    return {} as T
  }
}
