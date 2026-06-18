import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const { data, error } = await sb
    .from("anotacao_referencias")
    .select("*")
    .eq("deAnotacaoId", id)

  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const referencias: { paraId: string; paraTipo: string; paraTitulo: string }[] = await req.json()

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  // Apaga as antigas e reinsere — simples e idempotente
  await sb.from("anotacao_referencias").delete().eq("deAnotacaoId", id)

  if (referencias.length > 0) {
    const now = new Date().toISOString()
    const rows = referencias.map((r) => ({
      id: crypto.randomUUID(),
      deAnotacaoId: id,
      paraId: r.paraId,
      paraTipo: r.paraTipo,
      paraTitulo: r.paraTitulo,
      criadoEm: now,
    }))
    const { error } = await sb.from("anotacao_referencias").insert(rows)
    if (error) return jsonRes({ error: error.message }, 500)
  }

  return jsonRes({ ok: true })
}
