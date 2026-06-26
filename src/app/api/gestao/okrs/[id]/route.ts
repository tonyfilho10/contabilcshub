import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { data, error } = await sb.from("okrs").select("*, keyResults:key_results(*)").eq("id", id).single()
  if (error) return jsonRes({ error: error.message }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const campos: Record<string, unknown> = {}
  if (body.progresso !== undefined) campos.progresso = body.progresso
  if (body.status !== undefined)    campos.status = body.status
  if (body.titulo !== undefined)    campos.titulo = body.titulo
  const sb = createServiceClient()
  const { data, error } = await sb.from("okrs").update(campos).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { error } = await sb.from("okrs").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
