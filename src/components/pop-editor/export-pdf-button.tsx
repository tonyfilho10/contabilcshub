"use client"

import { useCallback } from "react"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportPdfButtonProps {
  titulo: string
}

export function ExportPdfButton({ titulo }: ExportPdfButtonProps) {
  const handleExport = useCallback(() => {
    // Armazena o título original para restaurar depois
    const prevTitle = document.title
    document.title = titulo
    window.print()
    document.title = prevTitle
  }, [titulo])

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FileDown className="h-4 w-4 mr-1" />
      Exportar PDF
    </Button>
  )
}
