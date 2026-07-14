import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { parseBalanceteComIA } from "@/lib/conferencias-ai-parser"
import { validarBalancete } from "@/lib/conferencias-validacao"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const arquivo = formData.get("arquivo")
  if (!(arquivo instanceof File)) return jsonRes({ error: "Envie um arquivo PDF" }, 400)

  const buffer = Buffer.from(await arquivo.arrayBuffer())

  let extraido
  try {
    extraido = await parseBalanceteComIA(buffer)
  } catch (err) {
    console.error("[conferencias/importar] Falha ao analisar PDF com IA:", err)
    return jsonRes({ error: "Não foi possível analisar o PDF enviado" }, 400)
  }

  if (extraido.contas.length === 0) {
    return jsonRes({ error: "Nenhuma conta encontrada nesse PDF. Verifique se é um balancete de verificação." }, 400)
  }

  const resultado = validarBalancete(extraido)
  return jsonRes(resultado)
}
