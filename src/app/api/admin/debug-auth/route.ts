import { NextResponse } from "next/server"

// Endpoint temporário de diagnóstico — remover após resolver o problema
export async function GET() {
  const supabaseUrl = "https://lpcetxaaqypxvcwprhff.supabase.co"
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

  const keyInfo = {
    hasKey: !!serviceKey,
    keyLength: serviceKey.length,
    keyPrefix: serviceKey.substring(0, 12),
    keySuffix: serviceKey.substring(serviceKey.length - 4),
  }

  // Testa a conexão com a API admin
  let authTestStatus = 0
  let authTestBody: unknown = null
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, {
      method: "GET",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    })
    authTestStatus = res.status
    authTestBody = await res.json().catch(() => null)
  } catch (e) {
    authTestBody = String(e)
  }

  return NextResponse.json({ keyInfo, authTestStatus, authTestBody })
}
