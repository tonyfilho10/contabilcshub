import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin().from("tags_anotacoes").select("*").order("nome")
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, cor } = await req.json()
  if (!nome?.trim()) return jsonRes({ error: "Nome obrigatório" }, 400)
  const { data, error } = await supabaseAdmin()
    .from("tags_anotacoes")
    .insert({ id: crypto.randomUUID(), nome: nome.trim(), cor: cor ?? "#6366f1" })
    .select().single()
  if (error) {
    if (error.code === "23505") return jsonRes({ error: "Tag já existe" }, 409)
    return jsonRes({ error: error.message }, 500)
  }
  return jsonRes(data, 201)
}
