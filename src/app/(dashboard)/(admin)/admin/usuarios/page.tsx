"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CargoBadge } from "@/components/admin/cargo-badge"
import { UsuarioForm, type UsuarioFormData } from "@/components/admin/usuario-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CARGOS_ORDENADOS, CARGO_CONFIG, type Cargo } from "@/lib/permissoes"
import {
  MoreHorizontal,
  Plus,
  Search,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Usuario {
  id: string
  nome: string
  email: string
  cargo: Cargo
  ativo: boolean
  avatar: string | null
  criadoEm: string
}

function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroCargo, setFiltroCargo] = useState<string>("todos")

  // modal criar/editar
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<UsuarioFormData | undefined>()

  // confirmação exclusão
  const [excluindo, setExcluindo] = useState<Usuario | null>(null)
  const [excluindoLoading, setExcluindoLoading] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (busca) params.set("busca", busca)
      if (filtroCargo !== "todos") params.set("cargo", filtroCargo)
      const res = await fetch(`/api/admin/usuarios?${params}`)
      const data = await res.json()
      setUsuarios(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [busca, filtroCargo])

  useEffect(() => {
    const t = setTimeout(carregar, 300)
    return () => clearTimeout(t)
  }, [carregar])

  const handleSalvar = async (data: UsuarioFormData) => {
    if (data.id) {
      // Edição
      const res = await fetch(`/api/admin/usuarios/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: data.nome, cargo: data.cargo, ativo: data.ativo, ...(data.senha ? { senha: data.senha } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao atualizar")
      }
    } else {
      // Criação — ID gerado pelo Supabase Auth no servidor
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar")
      }
    }
    await carregar()
  }

  const handleExcluir = async () => {
    if (!excluindo) return
    setExcluindoLoading(true)
    try {
      await fetch(`/api/admin/usuarios/${excluindo.id}`, { method: "DELETE" })
      setExcluindo(null)
      await carregar()
    } finally {
      setExcluindoLoading(false)
    }
  }

  const abrirEdicao = (u: Usuario) => {
    setEditando({ id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, ativo: u.ativo })
    setFormAberto(true)
  }

  const abrirCriacao = () => {
    setEditando(undefined)
    setFormAberto(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os membros e suas permissões no sistema
          </p>
        </div>
        <Button onClick={abrirCriacao} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome ou e-mail…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroCargo} onValueChange={(v) => setFiltroCargo(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Todos os cargos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cargos</SelectItem>
            {CARGOS_ORDENADOS.map((c) => (
              <SelectItem key={c} value={c}>
                {CARGO_CONFIG[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="hidden md:table-cell">E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Desde</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={u.avatar ?? ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {iniciais(u.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm truncate max-w-[140px]">{u.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <CargoBadge cargo={u.cargo} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        u.ativo
                          ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                          : "border-rose-500/50 text-rose-600 bg-rose-500/10"
                      )}
                    >
                      {u.ativo ? (
                        <><UserCheck className="h-3 w-3 mr-1" />Ativo</>
                      ) : (
                        <><UserX className="h-3 w-3 mr-1" />Inativo</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirEdicao(u)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setExcluindo(u)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contagem */}
      {!loading && usuarios.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""} encontrado{usuarios.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Modal criar/editar */}
      <UsuarioForm
        open={formAberto}
        onOpenChange={setFormAberto}
        inicial={editando}
        onSave={handleSalvar}
      />

      {/* Confirmação exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário{" "}
              <strong>{excluindo?.nome}</strong> e todos os seus dados serão removidos
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={excluindoLoading}
            >
              {excluindoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
