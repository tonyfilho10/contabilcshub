import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"

/** GET /api/perfis?ids=id1,id2,id3 — retorna perfis resumidos por IDs */
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")
  if (!ids) return jsonRes([])
  const lista = ids.split(",").filter(Boolean)
  if (!lista.length) return jsonRes([])

  // Tenta com service role primeiro
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("id,nome,avatar")
    .in("id", lista)

  if (!error && data?.length) return jsonRes(data)

  // Fallback com sessão do usuário
  try {
    const supabase = await createClient()
    const { data: data2 } = await supabase
      .from("profiles")
      .select("id,nome,avatar")
      .in("id", lista)
    return jsonRes(data2 ?? [])
  } catch {
    return jsonRes([])
  }
}
