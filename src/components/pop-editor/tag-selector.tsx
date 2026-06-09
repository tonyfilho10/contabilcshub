"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagItem {
  id: string
  nome: string
  cor: string
}

const DEFAULT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
]

interface TagSelectorProps {
  selectedTags: TagItem[]
  availableTags?: TagItem[]
  onChange: (tags: TagItem[]) => void
}

export function TagSelector({ selectedTags, availableTags = [], onChange }: TagSelectorProps) {
  const [search, setSearch] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0])
  const [creating, setCreating] = useState(false)

  const filtered = availableTags.filter(
    (t) =>
      t.nome.toLowerCase().includes(search.toLowerCase()) &&
      !selectedTags.find((s) => s.id === t.id)
  )

  function addTag(tag: TagItem) {
    onChange([...selectedTags, tag])
    setSearch("")
  }

  function removeTag(id: string) {
    onChange(selectedTags.filter((t) => t.id !== id))
  }

  function createTag() {
    if (!newTagName.trim()) return
    const tag: TagItem = {
      id: `new-${Date.now()}`,
      nome: newTagName.trim(),
      cor: newTagColor,
    }
    addTag(tag)
    setNewTagName("")
    setCreating(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.cor + "22", color: tag.cor, borderColor: tag.cor + "44" }}
            variant="outline"
            className="gap-1 pr-1 font-medium"
          >
            {tag.nome}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="rounded-full hover:bg-black/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedTags.length === 0 && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Nenhuma tag
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar ou criar tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCreating(!creating)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {filtered.length > 0 && search && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.cor + "22", color: tag.cor, borderColor: tag.cor + "44" }}
              variant="outline"
              className="cursor-pointer hover:opacity-80 font-medium"
              onClick={() => addTag(tag)}
            >
              + {tag.nome}
            </Badge>
          ))}
        </div>
      )}

      {creating && (
        <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
          <Input
            placeholder="Nome da tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && createTag()}
          />
          <div className="flex gap-1.5 flex-wrap">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewTagColor(color)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                  newTagColor === color ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={createTag} disabled={!newTagName.trim()}>
              Criar tag
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
