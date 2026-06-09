"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { Camera, Save, User, Eye, EyeOff, KeyRound, Loader2, LogOut } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, clearCurrentUserCache } from "@/lib/use-current-user"

export default function PerfilPage() {
  const currentUser = useCurrentUser()
  const router = useRouter()

  async function handleLogout() {
    clearCurrentUserCache()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Dados pessoais
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cargo, setCargo] = useState("")
  const [avatarSrc, setAvatarSrc] = useState("")
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Senha
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showNova, setShowNova] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [savingsenha, setSavingsenha] = useState(false)

  // Carrega dados do usuário logado
  useEffect(() => {
    if (currentUser) {
      setNome(currentUser.nome)
      setEmail(currentUser.email)
      setCargo(
        currentUser.cargo
          ? currentUser.cargo.charAt(0) + currentUser.cargo.slice(1).toLowerCase()
          : ""
      )
      setAvatarSrc(currentUser.avatar ?? "")
    }
  }, [currentUser])

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

  async function handleSavePerfil() {
    if (!nome.trim()) {
      toast.error("Informe seu nome")
      return
    }
    setSaving(true)
    try {
      if (!currentUser?.id) throw new Error("Usuário não identificado")
      const res = await fetch(`/api/admin/usuarios/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao salvar")
      }
      toast.success("Perfil atualizado!")
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!novaSenha || novaSenha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem")
      return
    }
    setSavingsenha(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw new Error(error.message)
      toast.success("Senha alterada com sucesso!")
      setNovaSenha("")
      setConfirmarSenha("")
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Erro ao alterar senha")
    } finally {
      setSavingsenha(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Meu Perfil"
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "Meu Perfil" },
        ]}
      />

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
                  value={email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado aqui.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cargo">Cargo / Função</Label>
                <Input
                  id="cargo"
                  value={cargo}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">O cargo é definido pelo administrador.</p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSavePerfil} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? "Salvando…" : "Salvar alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Defina uma nova senha para sua conta. Mínimo de 6 caracteres.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showNova ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNova((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmar ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmar((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingsenha}>
                    {savingsenha ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    {savingsenha ? "Alterando…" : "Alterar senha"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>

        {/* Sair */}
        <div className="flex justify-end pt-2 pb-6">
          <Button
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </div>

      </main>
    </div>
  )
}
