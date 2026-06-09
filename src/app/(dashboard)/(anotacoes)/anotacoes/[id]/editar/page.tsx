"use client"

import { use } from "react"
import { AnotacaoEditor } from "@/components/anotacao-editor"

export default function EditarAnotacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AnotacaoEditor modo="editar" id={id} />
}
