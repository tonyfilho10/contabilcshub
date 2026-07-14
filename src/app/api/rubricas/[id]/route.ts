import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { codigo, descricao, grupo, lancamento, contaDebito, contaCredito, historico } = await req.json()

  const sb = createServiceClient()
  const updates: Record<string, unknown> = { atualizadoEm: new Date().toISOString() }
  if (codigo       !== undefined) updates.codigo       = codigo?.trim()
  if (descricao    !== undefined) updates.descricao    = descricao?.trim()
  if (grupo        !== undefined) updates.grupo        = grupo
  if (lancamento   !== undefined) updates.lancamento   = lancamento?.trim() || null
  if (contaDebito  !== undefined) updates.contaDebito  = contaDebito?.trim() || null
  if (contaCredito !== undefined) updates.contaCredito = contaCredito?.trim() || null
  if (historico    !== undefined) updates.historico    = historico?.trim() || null

  const { data, error } = await sb.from("rubrica_mapeamentos").update(updates).eq("id", id).select().single()
  if (error) {
    if (error.code === "23505") return jsonRes({ error: "Já existe uma rubrica com esse código nesse grupo" }, 409)
    return jsonRes({ error: error.message }, 500)
  }
  return jsonRes(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { error } = await sb.from("rubrica_mapeamentos").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
