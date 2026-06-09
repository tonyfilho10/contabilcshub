"use client"

import { PERMISSOES, CARGO_CONFIG, CARGOS_ORDENADOS, type Cargo } from "@/lib/permissoes"
import { CargoBadge } from "@/components/admin/cargo-badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ──────────────────────────────────────────────
   Matriz de permissões por módulo
────────────────────────────────────────────── */

interface PermRow {
  modulo: string
  chave: string
  permissao: string
}

const LINHAS: PermRow[] = [
  // POPs
  { modulo: "POPs", chave: "pops.visualizar", permissao: "Visualizar POPs" },
  { modulo: "POPs", chave: "pops.criar",      permissao: "Criar POPs" },
  { modulo: "POPs", chave: "pops.editar",     permissao: "Editar POPs" },
  { modulo: "POPs", chave: "pops.excluir",    permissao: "Excluir POPs" },
  { modulo: "POPs", chave: "pops.aprovar",    permissao: "Aprovar POPs" },
  { modulo: "POPs", chave: "pops.publicar",   permissao: "Publicar POPs" },
  // Anotações
  { modulo: "Anotações", chave: "anotacoes.criar",   permissao: "Criar anotações" },
  { modulo: "Anotações", chave: "anotacoes.editar",  permissao: "Editar anotações" },
  { modulo: "Anotações", chave: "anotacoes.excluir", permissao: "Excluir anotações" },
  // Administração
  { modulo: "Administração", chave: "admin.verUsuarios",       permissao: "Ver usuários" },
  { modulo: "Administração", chave: "admin.criarUsuario",      permissao: "Criar usuários" },
  { modulo: "Administração", chave: "admin.editarUsuario",     permissao: "Editar usuários" },
  { modulo: "Administração", chave: "admin.excluirUsuario",    permissao: "Excluir usuários" },
  { modulo: "Administração", chave: "admin.gerenciarCargos",   permissao: "Gerenciar cargos" },
]

/** Navega em um objeto aninhado por chave do tipo "pops.visualizar" */
function getDeep(obj: Record<string, any>, chave: string): boolean {
  const [grupo, campo] = chave.split(".")
  return obj[grupo]?.[campo] ?? false
}

export default function PermissoesPage() {
  // Agrupa linhas por módulo
  const modulos = Array.from(new Set(LINHAS.map((l) => l.modulo)))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Permissões</h1>
        <p className="text-sm text-muted-foreground">
          Visão completa do que cada cargo pode fazer no sistema
        </p>
      </div>

      {/* Cards de cargo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CARGOS_ORDENADOS.map((cargo) => {
          const config = CARGO_CONFIG[cargo]
          return (
            <div
              key={cargo}
              className="rounded-xl border p-3 space-y-1.5"
              style={{ borderColor: config.cor + "44", background: config.cor + "0d" }}
            >
              <CargoBadge cargo={cargo} />
              <p className="text-xs text-muted-foreground leading-snug">{config.descricao}</p>
            </div>
          )
        })}
      </div>

      {/* Matriz */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-3 font-semibold min-w-[180px]">Permissão</th>
              {CARGOS_ORDENADOS.map((c) => (
                <th key={c} className="px-3 py-3 text-center min-w-[110px]">
                  <CargoBadge cargo={c} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modulos.map((modulo) => {
              const linhasModulo = LINHAS.filter((l) => l.modulo === modulo)
              return (
                <>
                  {/* Cabeçalho do módulo */}
                  <tr key={`h-${modulo}`} className="bg-muted/20 border-b">
                    <td
                      colSpan={CARGOS_ORDENADOS.length + 1}
                      className="px-4 py-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground"
                    >
                      {modulo}
                    </td>
                  </tr>
                  {linhasModulo.map((linha) => (
                    <tr key={linha.chave} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2.5 text-sm">{linha.permissao}</td>
                      {CARGOS_ORDENADOS.map((cargo) => {
                        const tem = getDeep(PERMISSOES[cargo] as any, linha.chave)
                        return (
                          <td key={cargo} className="px-3 py-2.5 text-center">
                            {tem ? (
                              <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        * Esta matriz define as permissões padrão de cada cargo. Modificações futuras poderão ser
        feitas por administradores com cargo Coordenador ou superior.
      </p>
    </div>
  )
}
