import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { extrairPaginasTexto, parseIndicePaginaComIA } from "@/lib/conferencias-ai-parser"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const arquivo = formData.get("arquivo")
  if (!(arquivo instanceof File)) return jsonRes({ error: "Envie um arquivo PDF" }, 400)

  const paginaRaw = formData.get("pagina")
  const pagina = typeof paginaRaw === "string" ? parseInt(paginaRaw, 10) : 1
  if (!Number.isInteger(pagina) || pagina < 1) return jsonRes({ error: "Página inválida" }, 400)

  const buffer = Buffer.from(await arquivo.arrayBuffer())

  let paginas: string[]
  try {
    paginas = await extrairPaginasTexto(buffer)
  } catch (err) {
    console.error("[conferencias/importar] Falha ao extrair texto do PDF:", err)
    return jsonRes({ error: "Não foi possível ler o PDF enviado" }, 400)
  }

  if (paginas.length === 0) {
    return jsonRes({ error: "Nenhuma página encontrada nesse PDF. Verifique se é um balancete de verificação." }, 400)
  }
  if (pagina > paginas.length) {
    return jsonRes({ error: `O PDF só tem ${paginas.length} página(s)` }, 400)
  }

  let indice
  try {
    indice = await parseIndicePaginaComIA(paginas[pagina - 1], pagina, paginas.length)
  } catch (err) {
    console.error(`[conferencias/importar] Falha ao analisar página ${pagina} com IA:`, err)
    return jsonRes({ error: `Não foi possível analisar a página ${pagina} do PDF enviado` }, 400)
  }

  return jsonRes({ ...indice, pagina, totalPaginas: paginas.length })
}
