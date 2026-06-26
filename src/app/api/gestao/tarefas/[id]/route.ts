import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { data, error } = await sb.from("tarefas").select("*").eq("id", id).single()
  if (error) return jsonRes({ error: error.message }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const campos: Record<string, unknown> = {}
  if (body.status !== undefined)            campos.status = body.status
  if (body.motivoTravado !== undefined)     campos.motivoTravado = body.motivoTravado
  if (body.leituraConfirmada !== undefined) campos.leituraConfirmada = body.leituraConfirmada
  if (body.descricao !== undefined)         campos.descricao = body.descricao
  if (body.responsavelId !== undefined)     campos.responsavelId = body.responsavelId
  if (body.prazo !== undefined)             campos.prazo = body.prazo
  if (body.contexto !== undefined)          campos.contexto = body.contexto

  const sb = createServiceClient()
  const { data, error } = await sb.from("tarefas").update(campos).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { error } = await sb.from("tarefas").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
