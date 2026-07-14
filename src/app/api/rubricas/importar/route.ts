import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"
import { parseRelatorioRubricasComIA } from "@/lib/rubricas-ai-parser"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const arquivo = formData.get("arquivo")
  if (!(arquivo instanceof File)) return jsonRes({ error: "Envie um arquivo PDF" }, 400)

  const buffer = Buffer.from(await arquivo.arrayBuffer())

  let relatorioItens
  try {
    relatorioItens = await parseRelatorioRubricasComIA(buffer)
  } catch (err) {
    console.error("[rubricas/importar] Falha ao analisar PDF com IA:", err)
    return jsonRes({ error: "Não foi possível analisar o PDF enviado" }, 400)
  }

  if (relatorioItens.length === 0) {
    return jsonRes({ error: "Nenhuma rubrica encontrada nesse PDF. Verifique se é o relatório de rubricas/itens não configurados." }, 400)
  }

  const sb = createServiceClient()
  const grupos = [...new Set(relatorioItens.map((i) => i.grupo))]
  const { data: mapeamentos, error } = await sb
    .from("rubrica_mapeamentos")
    .select("*")
    .in("grupo", grupos)
  if (error) return jsonRes({ error: error.message }, 500)

  const porChave = new Map((mapeamentos ?? []).map((m) => [`${m.grupo}::${m.codigo}`, m]))

  const itens = relatorioItens.map((i) => ({
    ...i,
    match: porChave.get(`${i.grupo}::${i.codigo}`) ?? null,
  }))

  return jsonRes({ itens })
}
