import { redirect } from "next/navigation"

export default async function AnotacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/anotacoes/${id}/editar`)
}
