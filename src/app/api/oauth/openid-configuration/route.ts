// OIDC 发现文档。通过 next.config 的 rewrite 暴露在 /.well-known/openid-configuration。
import { NextResponse } from "next/server";
import {
  ENDPOINTS,
  SUPPORTED_SCOPES,
  SUPPORTED_CLAIMS,
  SIGNING_ALG,
} from "@/lib/oauth/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      issuer: ENDPOINTS.issuer,
      authorization_endpoint: ENDPOINTS.authorization_endpoint,
      token_endpoint: ENDPOINTS.token_endpoint,
      userinfo_endpoint: ENDPOINTS.userinfo_endpoint,
      jwks_uri: ENDPOINTS.jwks_uri,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: [SIGNING_ALG],
      scopes_supported: SUPPORTED_SCOPES,
      claims_supported: SUPPORTED_CLAIMS,
      token_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_post",
        "none",
      ],
      code_challenge_methods_supported: ["S256", "plain"],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
