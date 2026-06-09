import { redirect } from "next/navigation"

export default async function PopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/pops/${id}/editar`)
}
