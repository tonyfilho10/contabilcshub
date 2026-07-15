import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { parseDescricoesComIA } from "@/lib/conferencias-ai-parser"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const arquivo = formData.get("arquivo")
  const classificacoesRaw = formData.get("classificacoes")
  if (!(arquivo instanceof File)) return jsonRes({ error: "Envie um arquivo PDF" }, 400)
  if (typeof classificacoesRaw !== "string") return jsonRes({ error: "Envie a lista de classificações" }, 400)

  let classificacoes: string[]
  try {
    classificacoes = JSON.parse(classificacoesRaw)
    if (!Array.isArray(classificacoes) || classificacoes.some((c) => typeof c !== "string")) throw new Error()
  } catch {
    return jsonRes({ error: "Lista de classificações inválida" }, 400)
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer())

  try {
    const descricoes = await parseDescricoesComIA(buffer, classificacoes)
    return jsonRes({ descricoes })
  } catch (err) {
    console.error("[conferencias/descricoes] Falha ao analisar PDF com IA:", err)
    return jsonRes({ error: "Não foi possível buscar as descrições desse lote de contas" }, 400)
  }
}
