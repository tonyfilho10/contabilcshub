import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin()
    .from("profiles").select("*").eq("id", id).single()
  if (error) return jsonRes({ error: "Não encontrado" }, 404)
  return jsonRes(data)
}
