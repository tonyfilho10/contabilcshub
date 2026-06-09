import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Folder } from "lucide-react"

export default function PastasPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Pastas"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }, { label: "Pastas" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Folder className="h-12 w-12 mb-3 opacity-25" />
            <p className="text-base font-medium">Nenhuma pasta criada</p>
            <p className="text-sm mt-1">Organize suas notas em pastas por assunto.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
