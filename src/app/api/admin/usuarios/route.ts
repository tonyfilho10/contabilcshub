import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"

async function queryUsuarios(busca: string, cargo: string | null) {
  // Tenta com service role primeiro
  try {
    const sb = supabaseAdmin()
    let q = sb.from("profiles").select("*").order("criadoEm", { ascending: false })
    if (cargo) q = q.eq("cargo", cargo)
    if (busca) q = q.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`)
    const { data, error } = await q
    if (!error) return data ?? []
  } catch {}

  // Fallback: usa sessão autenticada do usuário (requer policy RLS)
  const supabase = await createClient()
  let q2 = supabase.from("profiles").select("*").order("criadoEm", { ascending: false })
  if (cargo) q2 = q2.eq("cargo", cargo)
  if (busca) q2 = q2.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`)
  const { data, error } = await q2
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get("busca") ?? ""
  const cargo = searchParams.get("cargo")

  try {
    const data = await queryUsuarios(busca, cargo)
    return jsonRes(data)
  } catch (e) {
    return jsonRes({ error: String(e) }, 500)
  }
}

export async function POST(req: NextRequest) {
  const { nome, email, cargo, ativo, avatar, senha } = await req.json()

  if (!nome || !email)
    return jsonRes({ error: "nome e email são obrigatórios" }, 400)
  if (!senha || senha.length < 6)
    return jsonRes({ error: "Senha inicial deve ter pelo menos 6 caracteres" }, 400)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://lpcetxaaqypxvcwprhff.supabase.co"
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) return jsonRes({ error: "Configuração do servidor ausente (service key)" }, 500)

  // 1. Cria usuário no Supabase Auth via fetch direto
  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ email, password: senha, email_confirm: true }),
  })

  if (!authRes.ok) {
    const err = await authRes.json().catch(() => ({}))
    const msg = err.message ?? err.msg ?? "Erro ao criar usuário"
    if (msg.toLowerCase().includes("already")) return jsonRes({ error: "Já existe um usuário com esse e-mail" }, 409)
    return jsonRes({ error: msg }, 500)
  }

  const authData = await authRes.json()

  const userId = authData.id ?? authData.user?.id

  // 2. Cria o perfil
  const sb = await createClient()
  const { data, error } = await sb
    .from("profiles")
    .insert({
      id: userId,
      nome,
      email,
      cargo: cargo ?? "AUXILIAR",
      ativo: ativo ?? true,
      avatar: avatar ?? null,
    })
    .select()
    .single()

  if (error) {
    // Rollback: remove auth user via fetch direto
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
    }).catch(() => {})
    if (error.code === "23505") return jsonRes({ error: "E-mail já cadastrado" }, 409)
    return jsonRes({ error: error.message }, 500)
  }

  return jsonRes(data, 201)
}
