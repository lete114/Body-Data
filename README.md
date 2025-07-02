# 📦 body-data

[![visitors][visitors-src]][visitors-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

A lightweight, zero-dependency utility for extracting query parameters and request body data from both Node.js IncomingMessage and Web standard Request objects. Fully supports Node.js (18+), Deno, Bun, Cloudflare Workers, and any modern JavaScript runtime. Type-safe, auto-adaptive, and supports all common Content-Type formats.

## ✨ Features

- ✅ Works in Node.js (18+), Deno, Bun, Cloudflare Workers, and browsers
- ✅ Accepts both Node.js IncomingMessage and Web standard Request objects
- ✅ Type-safe with full TypeScript generics support
- ✅ Extract query parameters from `GET` requests
- ✅ Parse request body from `POST` requests
- ✅ Supports `application/json`, `x-www-form-urlencoded`, `text/plain`, `multipart/form-data`, and others
- ✅ Safe fallback parsing
- ✅ Zero dependencies
- ✅ Configurable parsing options: encoding, content-type override, raw mode, and custom error handling

## 📦 Installation

```bash
npm install body-data
# or
pnpm add body-data
````

---

## 🚀 Usage Examples

### 1. Using `bodyData`

`bodyData` is a high-level utility that returns both `params` (query) and `body` data.

```ts
import http from 'node:http'
import { bodyData } from 'body-data'

http.createServer(async (req, res) => {
  const data = await bodyData(req)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}).listen(3000)
```

**Request Example:**

```bash
curl "http://localhost:3000?name=lete&age=18" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"gender":"male"}'
```

**Response:**

```json
{
  "params": {
    "name": "lete",
    "age": "18"
  },
  "body": {
    "gender": "male"
  }
}
```

---

### 2. Using `getParams`

Use `getParams` to only extract query parameters from the URL.

```ts
import http from 'node:http'
import { getParams } from 'body-data'

http.createServer((req, res) => {
  const params = getParams(req)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ params }))
}).listen(3000)
```

**Request Example:**

```bash
curl "http://localhost:3000?foo=bar&count=10"
```

**Response:**

```json
{
  "params": {
    "foo": "bar",
    "count": "10"
  }
}
```

---

### 3. Using `getBody`

Use `getBody` to only extract the body from a `POST` request.

```ts
import http from 'node:http'
import { getBody } from 'body-data'

http.createServer(async (req, res) => {
  const body = await getBody(req)

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ body }))
}).listen(3000)
```

**Request Example:**

```bash
curl "http://localhost:3000" \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=1234"
```

**Response:**

```json
{
  "body": {
    "username": "test",
    "password": "1234"
  }
}
```

---

## 📖 API Reference

### `bodyData(req: IncomingMessage): Promise<{ params, body }>`

Returns an object with:

* `params`: Query parameters (from URL)
* `body`: Parsed request body

### `getParams(req: IncomingMessage): Record<string, any>`

Parses the query string from the request URL.

### `getBody(req: IncomingMessage): Promise<Record<string, any>>`

Parses the body of the request based on `Content-Type`. Supports:

* `application/json`
* `application/x-www-form-urlencoded`
* `text/plain`
* `multipart/form-data` (returns raw string)
* Fallback: returns `{ raw: string }`

#### Options (`IBodyOptions`):

| Option            | Type                   | Description                                                 |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| `raw`             | `boolean`              | Return raw body string instead of parsing. Default: `false` |
| `encoding`        | `BufferEncoding`       | Text encoding for reading the body. Default: `'utf-8'`      |
| `contentType`     | `string`               | Force a specific `Content-Type` (overrides request headers) |
| `backContentType` | `string`               | Fallback `Content-Type` when none is provided               |
| `onError`         | `(err: Error) => void` | Custom error handler for parse or stream errors             |

## ✅ Example with Custom Options

```ts
const body = await getBody(req, {
  raw: false,
  encoding: 'utf-8',
  contentType: 'application/json',
  backContentType: 'text/plain',
  onError: err => console.error('Body parse error:', err),
})
```

## 🧪 Testing

```bash
pnpm test
```

---

## 📄 License

[MIT](./LICENSE) License © [Lete114](https://github.com/lete114)

<!-- Badges -->

[visitors-src]: https://visitor-badge.imlete.cn/?id=github.Lete114/body-data&labelColor=080f12&color=1fa669&type=pv&style=flat
[visitors-href]: https://github.com/Lete114/visitor-badge

[npm-version-src]: https://img.shields.io/npm/v/body-data?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/body-data

[npm-downloads-src]: https://img.shields.io/npm/dm/body-data?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/body-data

[bundle-src]: https://img.shields.io/bundlephobia/minzip/body-data?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=body-data

[license-src]: https://img.shields.io/github/license/Lete114/body-data.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Lete114/body-data/blob/main/LICENSE

[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/body-data
