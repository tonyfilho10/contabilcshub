import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: indicadorId } = await params
  const { valor, data } = await req.json()
  if (valor === undefined) return jsonRes({ error: "Valor obrigatório" }, 400)

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const sbs = createServiceClient()
  const { data: medicao, error } = await sbs
    .from("medicoes")
    .insert({ indicadorId, valor: Number(valor), data: data ?? new Date().toISOString(), atualizadoPor: user?.id ?? "sistema" })
    .select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(medicao, 201)
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const medicaoId = searchParams.get("medicaoId")
  if (!medicaoId) return jsonRes({ error: "medicaoId obrigatório" }, 400)
  const { valor } = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from("medicoes").update({ valor: Number(valor) }).eq("id", medicaoId).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}
