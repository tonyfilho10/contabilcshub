import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

/** GET /api/perfis?ids=id1,id2,id3 — retorna perfis resumidos por IDs */
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")
  if (!ids) return jsonRes([])
  const lista = ids.split(",").filter(Boolean)
  if (!lista.length) return jsonRes([])

  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .select("id,nome,avatar")
    .in("id", lista)

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}
