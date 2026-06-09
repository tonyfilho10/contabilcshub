import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pops = await prisma.pop.findMany({
      include: { tags: { include: { tag: true } }, autor: true },
      orderBy: { atualizadoEm: "desc" },
    })
    return NextResponse.json(pops)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar POPs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, descricao, conteudo, status, versao, tags } = body

    const pop = await prisma.pop.create({
      data: {
        titulo,
        descricao,
        conteudo,
        status: status ?? "RASCUNHO",
        versao: versao ?? "1.0",
        autorId: "system",
      },
    })

    return NextResponse.json(pop, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar POP" }, { status: 500 })
  }
}
