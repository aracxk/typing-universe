#!/usr/bin/env node

import { createSign } from "node:crypto"
import { readFile } from "node:fs/promises"

const DOCS_SCOPE = "https://www.googleapis.com/auth/documents"
const TOKEN_URL = "https://oauth2.googleapis.com/token"

// ターゲットファイルの定義（環境変数で上書き可能）
const syncTargets = [
  {
    name: "TypingUniverse アーキテクチャ設計",
    markdownPath: process.env.DOCS_ARCHITECTURE_MD ?? "docs/01-architecture/architecture.md",
    documentId: process.env.DOCS_ARCHITECTURE_DOC_ID
  },
  {
    name: "TypingUniverse ユビキタス言語",
    markdownPath: process.env.DOCS_UBIQUITOUS_MD ?? "docs/02-domain-models/ubiquitous-language.md",
    documentId: process.env.DOCS_UBIQUITOUS_DOC_ID
  }
]

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function parseServiceAccount() {
  const rawJson = requireEnv("GOOGLE_SERVICE_ACCOUNT_JSON")
  const account = JSON.parse(rawJson)

  if (!account.client_email || !account.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key"
    )
  }

  return {
    ...account,
    private_key: account.private_key.replace(/\\n/g, "\n")
  }
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function signJwt(account) {
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: "RS256",
    typ: "JWT"
  }
  const claim = {
    iss: account.client_email,
    scope: DOCS_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  }

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claim)
  )}`
  const signer = createSign("RSA-SHA256")
  signer.update(unsignedToken)
  signer.end()
  const signature = signer.sign(account.private_key)

  return `${unsignedToken}.${base64Url(signature)}`
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}) for ${url}: ${text.slice(0, 1000)}`
    )
  }

  return text ? JSON.parse(text) : {}
}

async function getAccessToken(account) {
  const assertion = signJwt(account)
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  })

  const payload = await requestJson(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  })

  if (!payload.access_token) {
    throw new Error("Google OAuth response did not include an access token")
  }

  return payload.access_token
}

function utf16Length(value) {
  return [...value].reduce((length, char) => length + char.length, 0)
}

function buildDocumentBody(markdown, title) {
  const normalized = markdown.replace(/\r\n/g, "\n").trimEnd()
  return `${normalized}\n\nSynced to Google Docs from ${title} at ${new Date().toISOString()}.\n`
}

function collectHeadingStyleRequests(text) {
  const requests = []
  let index = 1

  for (const line of text.split("\n")) {
    const match = /^(#{1,3})\s+/.exec(line)
    const lineLength = utf16Length(line)

    if (match) {
      const style =
        match[1].length === 1
          ? "HEADING_1"
          : match[1].length === 2
            ? "HEADING_2"
            : "HEADING_3"

      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: index,
            endIndex: index + lineLength
          },
          paragraphStyle: {
            namedStyleType: style
          },
          fields: "namedStyleType"
        }
      })
    }

    index += lineLength + 1
  }

  return requests
}

async function getDocument(documentId, accessToken) {
  return requestJson(
    `https://docs.googleapis.com/v1/documents/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
}

async function batchUpdate(documentId, accessToken, requests) {
  if (requests.length === 0) {
    return
  }

  await requestJson(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ requests })
    }
  )
}

async function syncDocument(target, accessToken) {
  if (!target.documentId) {
    throw new Error(`Missing Google Doc ID for ${target.name}`)
  }

  const markdown = await readFile(target.markdownPath, "utf8")
  const text = buildDocumentBody(markdown, target.markdownPath)
  const document = await getDocument(target.documentId, accessToken)
  const endIndex = document.body.content.at(-1)?.endIndex ?? 1
  const requests = []

  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1
        }
      }
    })
  }

  requests.push({
    insertText: {
      location: {
        index: 1
      },
      text
    }
  })

  requests.push(...collectHeadingStyleRequests(text))

  await batchUpdate(target.documentId, accessToken, requests)
  console.log(`Synced ${target.name}: ${target.markdownPath}`)
}

async function main() {
  const account = parseServiceAccount()
  const accessToken = await getAccessToken(account)

  for (const target of syncTargets) {
    await syncDocument(target, accessToken)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
