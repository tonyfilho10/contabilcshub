"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser, ehSocio } from "@/lib/use-current-user"
import { Loader2 } from "lucide-react"

export default function GestaoLayout({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (user === null) router.replace("/login")
    if (user && !ehSocio(user.cargo)) router.replace("/dashboard")
  }, [user, router])

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ehSocio(user?.cargo)) return null

  return <>{children}</>
}
