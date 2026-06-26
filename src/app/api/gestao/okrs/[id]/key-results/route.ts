import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: okrId } = await params
  const { descricao, meta, unidade } = await req.json()
  if (!descricao?.trim()) return jsonRes({ error: "Descrição obrigatória" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("key_results").insert({ okrId, descricao: descricao.trim(), meta: Number(meta), unidade: unidade ?? "" }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url)
  const krId = searchParams.get("krId")
  if (!krId) return jsonRes({ error: "krId obrigatório" }, 400)
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from("key_results").update({ atual: Number(body.atual) }).eq("id", krId).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const krId = searchParams.get("krId")
  if (!krId) return jsonRes({ error: "krId obrigatório" }, 400)
  const sb = createServiceClient()
  const { error } = await sb.from("key_results").delete().eq("id", krId)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
