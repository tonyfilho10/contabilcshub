import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from("reunioes")
    .select("*, decisoes(*)")
    .order("criadoEm", { ascending: false })
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { tema } = await req.json()
  if (!tema?.trim()) return jsonRes({ error: "Tema obrigatório" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb
    .from("reunioes")
    .insert({ tema: tema.trim(), status: "ABERTA" })
    .select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
