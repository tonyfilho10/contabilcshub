import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const sbService = createServiceClient()

  const [notasRes, popsRes, refRes] = await Promise.all([
    sb.from("anotacoes").select("id, titulo, pastaId").eq("usuarioId", user.id),
    sbService.from("pops").select("id, titulo"),
    sb.from("anotacao_referencias").select("deAnotacaoId, paraId, paraTipo, paraTitulo"),
  ])

  const notas = (notasRes.data ?? []).map((n: any) => ({
    id: n.id, titulo: n.titulo, tipo: "nota",
  }))
  const pops = (popsRes.data ?? []).map((p: any) => ({
    id: p.id, titulo: p.titulo, tipo: "pop",
  }))

  const edges = (refRes.data ?? []).map((r: any) => ({
    de: r.deAnotacaoId,
    para: r.paraId,
    paraTipo: r.paraTipo,
  }))

  return jsonRes({ nodes: [...notas, ...pops], edges })
}
