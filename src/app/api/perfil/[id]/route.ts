import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Tenta primeiro com service role (bypassa RLS)
  const { data, error } = await supabaseAdmin()
    .from("profiles").select("*").eq("id", id).single()

  if (!error && data) return jsonRes(data)

  // Fallback: usa a sessão do próprio usuário (funciona com RLS "próprio perfil")
  try {
    const supabase = await createClient()
    const { data: data2, error: err2 } = await supabase
      .from("profiles").select("*").eq("id", id).single()
    if (!err2 && data2) return jsonRes(data2)
  } catch {}

  return jsonRes({ error: "Não encontrado" }, 404)
}
