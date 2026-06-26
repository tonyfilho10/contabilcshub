"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Cargo } from "@/lib/permissoes"

export interface CurrentUser {
  id: string
  email: string
  nome: string
  cargo: Cargo
  ativo: boolean
  avatar: string | null
}

let cache: CurrentUser | null | undefined = undefined // undefined = not loaded yet

export function clearCurrentUserCache() {
  cache = undefined
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null | undefined>(cache)

  useEffect(() => {
    if (cache !== undefined) {
      setUser(cache)
      return
    }

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        cache = null
        setUser(null)
        return
      }
      // Fetch profile from our API
      const res = await fetch(`/api/perfil/${data.user.id}`)
      if (res.ok) {
        const profile = await res.json()
        cache = {
          id: data.user.id,
          email: data.user.email ?? "",
          nome: profile.nome ?? data.user.email ?? "Usuário",
          cargo: (profile.cargo as Cargo) ?? "AUXILIAR",
          ativo: profile.ativo ?? true,
          avatar: profile.avatar ?? null,
        }
      } else {
        // Profile not found — create a default one
        cache = {
          id: data.user.id,
          email: data.user.email ?? "",
          nome: data.user.email?.split("@")[0] ?? "Usuário",
          cargo: "AUXILIAR",
          ativo: true,
          avatar: null,
        }
      }
      setUser(cache)
    })
  }, [])

  return user
}

/** Cargos que têm acesso à aba de Administração */
export const CARGOS_ADMIN: Cargo[] = ["ANALISTA", "COORDENADOR", "CONSULTOR", "AUDITOR"]

export function podeVerAdmin(cargo: Cargo | undefined): boolean {
  if (!cargo) return false
  return CARGOS_ADMIN.includes(cargo)
}

export function ehSocio(cargo: Cargo | undefined): boolean {
  return cargo === "SOCIO"
}
