"use client"

import { use } from "react"
import { PopFormEditor } from "@/components/pop-editor/pop-form-editor"

export default function EditarPOPPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PopFormEditor modo="editar" id={id} />
}
