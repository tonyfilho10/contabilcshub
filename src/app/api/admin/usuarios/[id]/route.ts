import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nome, email, cargo, ativo, avatar } = await req.json()
  const updates: Record<string, any> = {}
  if (nome   !== undefined) updates.nome   = nome
  if (email  !== undefined) updates.email  = email
  if (cargo  !== undefined) updates.cargo  = cargo
  if (ativo  !== undefined) updates.ativo  = ativo
  if (avatar !== undefined) updates.avatar = avatar
  const { data, error } = await supabaseAdmin()
    .from("profiles").update(updates).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin().from("profiles").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
