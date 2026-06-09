"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Lock, Eye, Server } from "lucide-react"

const STORAGE_KEY = "cshub:privacy-acknowledged"

export function PrivacyNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Só mostra se o usuário ainda não deu ciência
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function handleAcknowledge() {
    localStorage.setItem(STORAGE_KEY, "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    /* Overlay */
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">Seus dados são seus</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Aviso de privacidade — CSHUB Contábil</p>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Antes de continuar, queremos ser transparentes sobre como tratamos suas informações dentro desta plataforma.
          </p>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <p className="text-sm">
                <span className="font-semibold">Suas anotações pessoais são privadas.</span>{" "}
                O conteúdo do módulo de Anotações é exclusivamente seu — nenhum colega, gestor ou administrador tem acesso às suas notas.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Eye className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-sm">
                <span className="font-semibold">POPs são documentos da empresa.</span>{" "}
                Os Procedimentos Operacionais Padrão são conteúdo corporativo e podem ser visualizados pela organização conforme as permissões de cada cargo.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Server className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <p className="text-sm">
                <span className="font-semibold">Sem acesso dos desenvolvedores.</span>{" "}
                A equipe técnica da CSHUB não acessa o conteúdo das suas anotações pessoais nem suas informações privadas.
              </p>
            </li>
          </ul>

          <p className="text-xs text-muted-foreground border-t pt-4">
            Ao clicar em <strong>"Entendi"</strong> você confirma que leu e está ciente desta política. Esta mensagem não aparecerá novamente neste dispositivo.
          </p>
        </div>

        {/* Ação */}
        <div className="px-6 pb-6">
          <Button className="w-full" size="lg" onClick={handleAcknowledge}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Entendi — continuar para o sistema
          </Button>
        </div>
      </div>
    </div>
  )
}
