"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UsuarioSugestao {
  id: string
  nome: string
  email: string
  avatar?: string | null
  label?: string
}

interface MentionListProps {
  items: UsuarioSugestao[]
  command: (item: UsuarioSugestao) => void
}

export interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

export const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length)
          return true
        }
        if (event.key === "Enter") {
          if (items[selectedIndex]) command({ ...items[selectedIndex], label: items[selectedIndex].nome })
          return true
        }
        return false
      },
    }))

    if (!items.length) {
      return (
        <div className="rounded-lg border bg-popover shadow-md p-2 text-xs text-muted-foreground min-w-[180px]">
          Nenhum usuário encontrado
        </div>
      )
    }

    return (
      <div className="rounded-lg border bg-popover shadow-md overflow-hidden min-w-[200px] z-50">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => command({ ...item, label: item.nome })}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
              i === selectedIndex
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={item.avatar ?? ""} />
              <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                {iniciais(item.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight min-w-0">
              <p className="font-medium truncate">{item.nome}</p>
              <p className={cn("text-[10px] truncate", i === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {item.email}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  }
)

MentionList.displayName = "MentionList"
