import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const sb = await createClient()
  const { data, error } = await sb.from("tags").select("*").order("nome")
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { nome, cor, tipo } = await req.json()
  if (!nome?.trim()) return jsonRes({ error: "Nome obrigatório" }, 400)
  const sb = await createClient()
  const { data, error } = await sb
    .from("tags")
    .insert({ id: crypto.randomUUID(), nome: nome.trim(), cor: cor ?? "#f97316", tipo: tipo ?? "CUSTOM" })
    .select()
    .single()
  if (error) {
    if (error.code === "23505") return jsonRes({ error: "Tag já existe" }, 409)
    return jsonRes({ error: error.message }, 500)
  }
  return jsonRes(data, 201)
}
