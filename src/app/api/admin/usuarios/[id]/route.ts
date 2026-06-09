import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nome, email, cargo, ativo, avatar, senha } = await req.json()

  // Atualizar senha via auth.admin (precisa service role)
  if (senha) {
    if (senha.length < 6) return jsonRes({ error: "Senha deve ter pelo menos 6 caracteres" }, 400)
    try {
      const { error: authErr } = await supabaseAdmin().auth.admin.updateUserById(id, { password: senha })
      if (authErr) return jsonRes({ error: authErr.message }, 500)
    } catch (e) {
      return jsonRes({ error: `Erro ao atualizar senha: ${e}` }, 500)
    }
  }

  const updates: Record<string, unknown> = {}
  if (nome   !== undefined) updates.nome   = nome
  if (email  !== undefined) updates.email  = email
  if (cargo  !== undefined) updates.cargo  = cargo
  if (ativo  !== undefined) updates.ativo  = ativo
  if (avatar !== undefined) updates.avatar = avatar

  // Se só veio senha, retorna ok sem update de perfil
  if (!Object.keys(updates).length) return jsonRes({ ok: true })

  const sb = await createClient()
  const { data, error } = await sb
    .from("profiles").update(updates).eq("id", id).select().single()
  if (!error && data) return jsonRes(data)

  try {
    const { data: d2, error: e2 } = await supabaseAdmin()
      .from("profiles").update(updates).eq("id", id).select().single()
    if (e2) return jsonRes({ error: e2.message }, 500)
    return jsonRes(d2)
  } catch (e) {
    return jsonRes({ error: String(e) }, 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Delete no auth (precisa de service role)
  try {
    await supabaseAdmin().auth.admin.deleteUser(id)
  } catch {}
  // Delete no profile
  const sb = await createClient()
  const { error } = await sb.from("profiles").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
