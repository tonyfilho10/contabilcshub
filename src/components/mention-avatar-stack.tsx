"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useProfilesCache } from "@/lib/use-profiles-cache"

interface MentionAvatarStackProps {
  ids: string[]
  max?: number
}

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function MentionAvatarStack({ ids, max = 3 }: MentionAvatarStackProps) {
  const profiles = useProfilesCache(ids)

  if (!ids.length) return null

  const visible = profiles.slice(0, max)
  const extra = ids.length - visible.length

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((p) => (
        <Tooltip key={p.id}>
          <TooltipTrigger>
            <Avatar className="h-5 w-5 border-2 border-background ring-0">
              <AvatarImage src={p.avatar ?? ""} />
              <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                {initials(p.nome)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {p.nome}
          </TooltipContent>
        </Tooltip>
      ))}
      {extra > 0 && (
        <div className="h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
          +{extra}
        </div>
      )}
    </div>
  )
}
