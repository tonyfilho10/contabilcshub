import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nome, email, cargo, ativo, avatar, senha } = await req.json()

  // Atualizar senha via fetch direto à API admin do Supabase
  if (senha) {
    if (senha.length < 6) return jsonRes({ error: "Senha deve ter pelo menos 6 caracteres" }, 400)
    const supabaseUrl = "https://lpcetxaaqypxvcwprhff.supabase.co"
    const serviceKey  = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()
    if (!serviceKey) return jsonRes({ error: "Configuração do servidor ausente (service key)" }, 500)
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ password: senha }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return jsonRes({ error: err.message ?? `Erro ao atualizar senha (HTTP ${res.status})` }, 500)
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://lpcetxaaqypxvcwprhff.supabase.co"
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Delete no auth via fetch direto
  await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
  }).catch(() => {})

  // Delete no profile
  const sb = await createClient()
  const { error } = await sb.from("profiles").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
