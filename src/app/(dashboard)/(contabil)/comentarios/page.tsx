import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function ComentariosPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Comentários"
        breadcrumbs={[{ label: "Contábil", href: "/dashboard" }, { label: "Comentários" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-25" />
            <p className="text-base font-medium">Nenhum comentário ainda</p>
            <p className="text-sm mt-1">Comentários aparecem ao interagir com os POPs.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
