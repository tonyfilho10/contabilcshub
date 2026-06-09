import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nome, cor, tipo } = await req.json()
  const updates: Record<string, unknown> = {}
  if (nome !== undefined) updates.nome = nome.trim()
  if (cor  !== undefined) updates.cor  = cor
  if (tipo !== undefined) updates.tipo = tipo
  const sb = await createClient()
  const { data, error } = await sb.from("tags").update(updates).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, error.code === "PGRST116" ? 404 : 500)
  return jsonRes(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = await createClient()
  const { error } = await sb.from("tags").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
