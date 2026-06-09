import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pops = await prisma.pop.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { atualizadoEm: "desc" },
    })
    return NextResponse.json(pops)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[GET /api/pops]", msg)
    return NextResponse.json({ error: "Erro ao buscar POPs", detail: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, descricao, conteudo, status, versao } = body

    if (!titulo?.trim()) {
      return NextResponse.json({ error: "Título obrigatório" }, { status: 400 })
    }

    const pop = await prisma.pop.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao ?? null,
        conteudo: conteudo ?? null,
        status: status ?? "RASCUNHO",
        versao: versao ?? "1.0",
      },
    })

    return NextResponse.json(pop, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[POST /api/pops]", msg)
    return NextResponse.json({ error: "Erro ao criar POP", detail: msg }, { status: 500 })
  }
}
