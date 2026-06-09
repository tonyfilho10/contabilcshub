"use client"

import { useCallback, useState } from "react"
import { Paperclip, X, FileText, Image, File, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnexoItem {
  id: string
  nome: string
  tipo: string
  tamanho?: number
  url?: string
  file?: File
}

interface AnexosUploadProps {
  anexos: AnexoItem[]
  onChange: (anexos: AnexoItem[]) => void
}

function formatBytes(bytes?: number) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileIcon({ tipo }: { tipo: string }) {
  if (tipo.startsWith("image/")) return <Image className="h-4 w-4 text-blue-500" />
  if (tipo === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-slate-500" />
}

export function AnexosUpload({ anexos, onChange }: AnexosUploadProps) {
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const novos: AnexoItem[] = Array.from(files).map((f) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        nome: f.name,
        tipo: f.type,
        tamanho: f.size,
        file: f,
      }))
      onChange([...anexos, ...novos])
    },
    [anexos, onChange]
  )

  function removeAnexo(id: string) {
    onChange(anexos.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-center">
          Arraste arquivos ou{" "}
          <span className="text-primary font-medium">clique para selecionar</span>
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {anexos.length > 0 && (
        <div className="space-y-1.5">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30"
            >
              <FileIcon tipo={anexo.tipo} />
              <span className="flex-1 text-sm truncate">{anexo.nome}</span>
              {anexo.tamanho && (
                <span className="text-xs text-muted-foreground">{formatBytes(anexo.tamanho)}</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeAnexo(anexo.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
