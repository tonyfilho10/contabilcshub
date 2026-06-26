import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { data, error } = await sb.from("rituais").select("*, ocorrencias(*)").eq("id", id).single()
  if (error) return jsonRes({ error: error.message }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from("rituais").update(body).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { error } = await sb.from("rituais").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
