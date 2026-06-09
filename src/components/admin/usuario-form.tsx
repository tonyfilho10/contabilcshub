"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CARGOS_ORDENADOS, CARGO_CONFIG, type Cargo } from "@/lib/permissoes"
import { CargoBadge } from "./cargo-badge"

export interface UsuarioFormData {
  id?: string
  nome: string
  email: string
  cargo: Cargo
  ativo: boolean
  senha?: string
}

interface UsuarioFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  inicial?: UsuarioFormData
  onSave: (data: UsuarioFormData) => Promise<void>
}

const EMPTY: UsuarioFormData = {
  nome: "",
  email: "",
  cargo: "AUXILIAR",
  ativo: true,
  senha: "",
}

export function UsuarioForm({ open, onOpenChange, inicial, onSave }: UsuarioFormProps) {
  const [form, setForm] = useState<UsuarioFormData>(inicial ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [showSenha, setShowSenha] = useState(false)

  const isEdicao = !!inicial?.id

  // Sincroniza form sempre que o dialog abre ou o usuário editado muda
  useEffect(() => {
    if (open) {
      setForm(inicial ?? EMPTY)
      setErro("")
      setShowSenha(false)
    }
  }, [open, inicial])

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.email.trim()) {
      setErro("Nome e e-mail são obrigatórios.")
      return
    }
    if (!isEdicao && !form.senha?.trim()) {
      setErro("Defina uma senha inicial para o usuário.")
      return
    }
    if (form.senha && form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    setErro("")
    setLoading(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } catch (err: unknown) {
      setErro((err as Error)?.message ?? "Erro ao salvar usuário.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdicao ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Nome */}
          <div className="space-y-1">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Ana Silva"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="ana.silva@empresa.com"
              disabled={isEdicao}
            />
            {isEdicao && (
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            )}
          </div>

          {/* Senha — criação obrigatória, edição opcional */}
          <div className="space-y-1">
            <Label htmlFor="senha">{isEdicao ? "Nova senha" : "Senha inicial"}</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showSenha ? "text" : "password"}
                value={form.senha ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                placeholder={isEdicao ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEdicao
                ? "Preencha apenas se quiser redefinir a senha deste usuário."
                : "O usuário poderá redefinir a senha no perfil após o primeiro acesso."}
            </p>
          </div>

          {/* Cargo */}
          <div className="space-y-1">
            <Label htmlFor="cargo">Cargo / Permissão</Label>
            <Select
              value={form.cargo}
              onValueChange={(v) => setForm((f) => ({ ...f, cargo: v as Cargo }))}
            >
              <SelectTrigger id="cargo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARGOS_ORDENADOS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <CargoBadge cargo={c} />
                      <span className="text-xs text-muted-foreground">
                        {CARGO_CONFIG[c].descricao}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Conta ativa</p>
              <p className="text-xs text-muted-foreground">
                Usuários inativos não conseguem acessar o sistema
              </p>
            </div>
            <Switch
              checked={form.ativo}
              onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdicao ? "Salvar alterações" : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
