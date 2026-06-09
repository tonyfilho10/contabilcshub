import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Tag } from "lucide-react"

export default function TagsAnotacoesPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Tags das Notas"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }, { label: "Tags" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Tag className="h-12 w-12 mb-3 opacity-25" />
            <p className="text-base font-medium">Nenhuma tag criada</p>
            <p className="text-sm mt-1">As tags das notas são independentes das tags dos POPs.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
