import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get("busca") ?? ""
  const cargo = searchParams.get("cargo")
  const sb = supabaseAdmin()
  let q = sb.from("profiles").select("*").order("criadoEm", { ascending: false })
  if (cargo) q = q.eq("cargo", cargo)
  if (busca) q = q.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`)
  const { data, error } = await q
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, email, cargo, ativo, avatar, senha } = await req.json()

  if (!nome || !email)
    return jsonRes({ error: "nome e email são obrigatórios" }, 400)
  if (!senha || senha.length < 6)
    return jsonRes({ error: "Senha inicial deve ter pelo menos 6 caracteres" }, 400)

  const sb = supabaseAdmin()

  // 1. Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.toLowerCase().includes("already")) {
      return jsonRes({ error: "Já existe um usuário com esse e-mail" }, 409)
    }
    return jsonRes({ error: authError.message }, 500)
  }

  const userId = authData.user.id

  // 2. Cria o perfil
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
    // Rollback: remove o auth user criado
    await sb.auth.admin.deleteUser(userId)
    if (error.code === "23505") return jsonRes({ error: "E-mail já cadastrado" }, 409)
    return jsonRes({ error: error.message }, 500)
  }

  return jsonRes(data, 201)
}
