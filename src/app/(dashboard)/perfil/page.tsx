"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Camera, Save, User } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function PerfilPage() {
  const [nome, setNome] = useState("Usuário")
  const [email, setEmail] = useState("")
  const [cargo, setCargo] = useState("")
  const [avatarSrc, setAvatarSrc] = useState("")
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US"

  const handleFile = useCallback((file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem (PNG, JPG, WEBP)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter até 5 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setAvatarSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  async function handleSave() {
    if (!nome.trim()) {
      toast.error("Informe seu nome")
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800)) // placeholder
    toast.success("Perfil atualizado!")
    setSaving(false)
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Meu Perfil"
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "Meu Perfil" },
        ]}
      >
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Foto de perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>PNG, JPG ou WEBP — máximo 5 MB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar grande */}
                <div className="relative shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Área de drop */}
                <label
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors",
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    handleFile(e.dataTransfer.files[0] ?? null)
                  }}
                >
                  <User className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground text-center">
                    Arraste ou{" "}
                    <span className="text-primary font-semibold">clique para selecionar</span>
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {avatarSrc && (
                <button
                  type="button"
                  onClick={() => setAvatarSrc("")}
                  className="mt-3 text-xs text-destructive hover:underline"
                >
                  Remover foto
                </button>
              )}
            </CardContent>
          </Card>

          {/* Dados pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cargo">Cargo / Função</Label>
                <Input
                  id="cargo"
                  placeholder="Ex: Analista Contábil"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Salvando…" : "Salvar alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
