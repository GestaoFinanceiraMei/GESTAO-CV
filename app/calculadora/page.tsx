import { AppShell } from "@/components/app-shell"
import { CalculatorContent } from "@/components/calculator-content"
import { Suspense } from "react"

export default function CalculadoraPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-4 text-muted-foreground">Carregando...</div>}>
        <CalculatorContent />
      </Suspense>
    </AppShell>
  )
}
