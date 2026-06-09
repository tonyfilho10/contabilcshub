import { NextResponse } from "next/server"

/** Sempre retorna JSON, mesmo em erros inesperados */
export function jsonRes(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/** Trata erros Prisma comuns e retorna mensagem legível */
export function handlePrismaError(err: any): NextResponse {
  const msg: string = err?.message ?? String(err)
  const code: string = err?.code ?? ""

  if (code === "P2025") return jsonRes({ error: "Registro não encontrado" }, 404)
  if (code === "P2002") return jsonRes({ error: "Já existe um registro com esses dados" }, 409)

  if (msg.includes("P1001") || msg.includes("ECONNREFUSED") || msg.includes("Can't reach")) {
    return jsonRes(
      { error: "Banco de dados offline. Ative o projeto no Supabase e aguarde ~30 segundos." },
      503
    )
  }
  if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("no such table")) {
    return jsonRes(
      { error: "Tabelas não encontradas. Execute: npx prisma db push" },
      503
    )
  }

  console.error("[API Error]", msg)
  return jsonRes({ error: "Erro interno do servidor", detail: msg }, 500)
}
