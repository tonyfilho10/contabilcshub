import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Tags } from "lucide-react"

export default function TagsPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Tags"
        breadcrumbs={[{ label: "Contábil", href: "/dashboard" }, { label: "Tags" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Tags className="h-12 w-12 mb-3 opacity-25" />
            <p className="text-base font-medium">Nenhuma tag cadastrada</p>
            <p className="text-sm mt-1">As tags são criadas ao editar um POP.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
