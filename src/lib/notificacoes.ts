import { createClient } from "./supabase/server"
import { enviarPushParaUsuarios } from "./push"

export type TipoNotificacao = "mencao_anotacao" | "mencao_pop"

export async function criarNotificacoesMencao({
  mencionadosIds,
  autorId,
  tipo,
  titulo,
  mensagem,
  referenciaId,
}: {
  mencionadosIds: string[]
  autorId?: string | null
  tipo: TipoNotificacao
  titulo: string
  mensagem?: string
  referenciaId: string
}) {
  if (!mencionadosIds?.length) return

  const destinatarios = mencionadosIds.filter((id) => id !== autorId)
  if (!destinatarios.length) return

  const url = tipo === "mencao_pop" ? `/pops/${referenciaId}` : `/anotacoes/${referenciaId}`

  // 1. Salva notificações no banco
  const sb = await createClient()
  await sb.from("notificacoes").insert(
    destinatarios.map((uid) => ({
      usuarioId: uid,
      tipo,
      titulo,
      mensagem: mensagem ?? null,
      lida: false,
      referenciaId,
    }))
  )

  // 2. Envia push para dispositivos registrados
  await enviarPushParaUsuarios(destinatarios, { titulo, mensagem, referenciaId, url })
}
