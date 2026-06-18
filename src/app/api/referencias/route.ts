import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const limit = Math.min(Number(searchParams.get("limit") ?? "8"), 20)

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const sbService = createServiceClient()

  const [anotacoesRes, popsRes] = await Promise.all([
    sb.from("anotacoes")
      .select("id, titulo")
      .eq("usuarioId", user.id)
      .ilike("titulo", `%${q}%`)
      .order("atualizadoEm", { ascending: false })
      .limit(limit),
    sbService.from("pops")
      .select("id, titulo")
      .ilike("titulo", `%${q}%`)
      .order("atualizadoEm", { ascending: false })
      .limit(limit),
  ])

  const notas = (anotacoesRes.data ?? []).map((n: any) => ({ id: n.id, titulo: n.titulo, tipo: "nota" as const }))
  const pops  = (popsRes.data  ?? []).map((p: any) => ({ id: p.id, titulo: p.titulo, tipo: "pop"  as const }))

  return jsonRes([...notas, ...pops].slice(0, limit))
}
