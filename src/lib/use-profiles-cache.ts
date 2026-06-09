"use client"

import { useEffect, useState } from "react"

export interface PerfilResumido {
  id: string
  nome: string
  avatar: string | null
}

// Cache global em memória
const cache: Map<string, PerfilResumido> = new Map()
const pending: Set<string> = new Set()
let flushTimer: ReturnType<typeof setTimeout> | null = null
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    flushTimer = null
    const ids = [...pending]
    pending.clear()
    if (!ids.length) return

    try {
      const res = await fetch(`/api/perfis?ids=${ids.join(",")}`)
      if (!res.ok) return
      const data: PerfilResumido[] = await res.json()
      data.forEach((p) => cache.set(p.id, p))
      notifyListeners()
    } catch {
      // silencioso
    }
  }, 50) // batch de 50ms
}

/** Solicita que os IDs sejam carregados (se ainda não estiverem no cache) */
export function requestProfiles(ids: string[]) {
  let dirty = false
  for (const id of ids) {
    if (!cache.has(id) && !pending.has(id)) {
      pending.add(id)
      dirty = true
    }
  }
  if (dirty) scheduleFlush()
}

/** Hook que retorna perfis do cache para os IDs fornecidos */
export function useProfilesCache(ids: string[]): PerfilResumido[] {
  const [, rerender] = useState(0)

  useEffect(() => {
    const fn = () => rerender((n) => n + 1)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  useEffect(() => {
    if (ids.length) requestProfiles(ids)
  }, [ids.join(",")])  // eslint-disable-line react-hooks/exhaustive-deps

  return ids.map((id) => cache.get(id)).filter(Boolean) as PerfilResumido[]
}
