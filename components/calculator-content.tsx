"use client"

import { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatBRL, formatPercent, formatM2 } from "@/lib/format"
import type { Produto } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Save, Share2, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import useSWR from "swr"

async function fetchProdutos() {
  const supabase = createClient()
  const { data } = await supabase
    .from("produtos")
    .select("*, tamanhos(*), acabamentos(*), tipos_material(*)")
    .order("created_at", { ascending: true })
  return (data as Produto[]) || []
}

type UnitType = "mm" | "cm"

export function CalculatorContent() {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get("produto")

  const { data: produtos = [], isLoading } = useSWR(
    "produtos-calc",
    fetchProdutos
  )

  const [selectedProdutoId, setSelectedProdutoId] = useState<string>(
    preselectedId || ""
  )
  const [selectedTipoMaterial, setSelectedTipoMaterial] = useState<string>("")
  const [selectedTamanhoId, setSelectedTamanhoId] = useState<string>("")
  const [customLargura, setCustomLargura] = useState<string>("")
  const [customAltura, setCustomAltura] = useState<string>("")
  const [unit, setUnit] = useState<UnitType>("mm")
  const [selectedAcabamentos, setSelectedAcabamentos] = useState<
    Record<string, boolean>
  >({})
  const [precoVenda, setPrecoVenda] = useState<string>("")
  const [clienteNome, setClienteNome] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // Set preselected product when data loads
  useMemo(() => {
    if (preselectedId && produtos.length > 0 && !selectedProdutoId) {
      setSelectedProdutoId(preselectedId)
    }
  }, [preselectedId, produtos, selectedProdutoId])

  const selectedProduto = produtos.find((p) => p.id === selectedProdutoId)

  const hasPredefinedSizes =
    selectedProduto?.tamanhos && selectedProduto.tamanhos.length > 0
  const hasAcabamentos =
    selectedProduto?.acabamentos && selectedProduto.acabamentos.length > 0
  const hasTiposMaterial =
    selectedProduto?.tipos_material && selectedProduto.tipos_material.length > 0

  // Get size from selection or custom input
  const dimensions = useMemo(() => {
    if (hasPredefinedSizes && selectedTamanhoId) {
      const tamanho = selectedProduto?.tamanhos?.find(
        (t) => t.id === selectedTamanhoId
      )
      if (tamanho) {
        return {
          largura_mm: tamanho.largura_mm,
          altura_mm: tamanho.altura_mm,
          label: tamanho.label,
        }
      }
    }

    const largura = parseFloat(customLargura)
    const altura = parseFloat(customAltura)
    if (!isNaN(largura) && !isNaN(altura) && largura > 0 && altura > 0) {
      const larguraMm = unit === "cm" ? largura * 10 : largura
      const alturaMm = unit === "cm" ? altura * 10 : altura
      return {
        largura_mm: larguraMm,
        altura_mm: alturaMm,
        label: `${largura}x${altura}${unit}`,
      }
    }

    return null
  }, [
    hasPredefinedSizes,
    selectedTamanhoId,
    selectedProduto,
    customLargura,
    customAltura,
    unit,
  ])

  // Calculate everything
  const calcResult = useMemo(() => {
    if (!selectedProduto || !dimensions) return null

    const larguraM = dimensions.largura_mm / 1000
    const alturaM = dimensions.altura_mm / 1000
    const m2 = larguraM * alturaM

    let custoAcabamentos = 0
    if (hasAcabamentos && selectedProduto.acabamentos) {
      for (const acabamento of selectedProduto.acabamentos) {
        if (selectedAcabamentos[acabamento.id]) {
          custoAcabamentos += acabamento.custo
        }
      }
    }

    const custoFornecedor =
      m2 * selectedProduto.custo_m2 + custoAcabamentos + (selectedProduto.custo_fixo || 0)
    const venda = parseFloat(precoVenda) || 0
    const lucro = venda - custoFornecedor
    const margem = venda > 0 ? (lucro / venda) * 100 : 0

    return {
      m2,
      custoFornecedor,
      precoVenda: venda,
      lucro,
      margem,
      custoAcabamentos,
    }
  }, [
    selectedProduto,
    dimensions,
    hasAcabamentos,
    selectedAcabamentos,
    precoVenda,
  ])

  const handleToggleAcabamento = useCallback((id: string) => {
    setSelectedAcabamentos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleSave = async () => {
    if (!selectedProduto || !calcResult || !dimensions) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const acabamentosObj: Record<string, number> = {}
      if (selectedProduto.acabamentos) {
        for (const a of selectedProduto.acabamentos) {
          if (selectedAcabamentos[a.id]) {
            acabamentosObj[a.nome] = a.custo
          }
        }
      }

      const { error } = await supabase.from("calculos").insert({
        produto_id: selectedProduto.id,
        tamanho_label: dimensions.label,
        largura_mm: dimensions.largura_mm,
        altura_mm: dimensions.altura_mm,
        m2: calcResult.m2,
        custo_fornecedor: calcResult.custoFornecedor,
        preco_venda: calcResult.precoVenda,
        lucro: calcResult.lucro,
        margem_percent: calcResult.margem,
        acabamentos_selecionados:
          Object.keys(acabamentosObj).length > 0 ? acabamentosObj : null,
        tipo_material: selectedTipoMaterial || null,
        cliente_nome: clienteNome || null,
      })

      if (error) throw error
      toast.success("Orcamento salvo com sucesso!")
    } catch {
      toast.error("Erro ao salvar orcamento")
    } finally {
      setIsSaving(false)
    }
  }

  const handleWhatsApp = () => {
    if (!selectedProduto || !calcResult || !dimensions) return

    const acabamentosText = selectedProduto.acabamentos
      ?.filter((a) => selectedAcabamentos[a.id])
      .map((a) => a.nome)
      .join(", ")

    let msg = `*Orcamento - ${selectedProduto.nome}*\n`
    msg += `Tamanho: ${dimensions.label}\n`
    if (selectedTipoMaterial) msg += `Material: ${selectedTipoMaterial}\n`
    if (acabamentosText) msg += `Acabamento: ${acabamentosText}\n`
    msg += `*Valor: ${formatBRL(calcResult.precoVenda)}*`

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  const handleSelectProduto = (id: string) => {
    setSelectedProdutoId(id)
    setSelectedTamanhoId("")
    setCustomLargura("")
    setCustomAltura("")
    setSelectedAcabamentos({})
    setSelectedTipoMaterial("")
    setPrecoVenda("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Calculadora
        </h1>
        <p className="text-sm text-muted-foreground">
          Calcule custos, margens e lucros
        </p>
      </header>

      {/* Step 1: Select Product */}
      <div className="mb-4">
        <Label className="mb-2 block text-sm font-medium text-foreground">
          Produto
        </Label>
        <Select value={selectedProdutoId} onValueChange={handleSelectProduto}>
          <SelectTrigger className="bg-card text-foreground">
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {produtos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduto && (
        <>
          {/* Step 2: Material Type */}
          {hasTiposMaterial && (
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Tipo de Material
              </Label>
              <Select
                value={selectedTipoMaterial}
                onValueChange={setSelectedTipoMaterial}
              >
                <SelectTrigger className="bg-card text-foreground">
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduto.tipos_material!.map((t) => (
                    <SelectItem key={t.id} value={t.nome}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Size */}
          <div className="mb-4">
            <Label className="mb-2 block text-sm font-medium text-foreground">
              Tamanho
            </Label>

            {hasPredefinedSizes ? (
              <Select
                value={selectedTamanhoId}
                onValueChange={setSelectedTamanhoId}
              >
                <SelectTrigger className="bg-card text-foreground">
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduto.tamanhos!.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={unit === "mm" ? "default" : "outline"}
                    onClick={() => setUnit("mm")}
                  >
                    mm
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={unit === "cm" ? "default" : "outline"}
                    onClick={() => setUnit("cm")}
                  >
                    cm
                  </Button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Largura ({unit})
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={customLargura}
                      onChange={(e) => setCustomLargura(e.target.value)}
                      className="bg-card text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Altura ({unit})
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={customAltura}
                      onChange={(e) => setCustomAltura(e.target.value)}
                      className="bg-card text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Acabamentos */}
          {hasAcabamentos && (
            <div className="mb-4">
              <Label className="mb-2 block text-sm font-medium text-foreground">
                Acabamentos
              </Label>
              <div className="flex flex-col gap-2">
                {selectedProduto.acabamentos!.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={!!selectedAcabamentos[a.id]}
                      onCheckedChange={() => handleToggleAcabamento(a.id)}
                    />
                    <span className="flex-1 text-sm text-foreground">
                      {a.nome}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      +{formatBRL(a.custo)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Preco de Venda */}
          <div className="mb-4">
            <Label className="mb-2 block text-sm font-medium text-foreground">
              Preco de Venda (R$)
            </Label>
            <Input
              type="number"
              placeholder="0,00"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
              className="bg-card text-lg font-semibold text-foreground"
            />
          </div>

          {/* Step 6: Cliente */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium text-foreground">
              Nome do Cliente (opcional)
            </Label>
            <Input
              type="text"
              placeholder="Ex: Joao da Padaria"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className="bg-card text-foreground"
            />
          </div>

          {/* Results */}
          {calcResult && dimensions && (
            <Card className="mb-4 border-border bg-card">
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Resultado
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Area total</span>
                    <span className="font-medium text-foreground">
                      {formatM2(calcResult.m2)}
                    </span>
                  </div>

                  {calcResult.custoAcabamentos > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Acabamentos</span>
                      <span className="font-medium text-foreground">
                        +{formatBRL(calcResult.custoAcabamentos)}
                      </span>
                    </div>
                  )}

                  {(selectedProduto.custo_fixo || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Custo fixo</span>
                      <span className="font-medium text-foreground">
                        +{formatBRL(selectedProduto.custo_fixo)}
                      </span>
                    </div>
                  )}

                  <div className="my-1 border-t border-border" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Custo fornecedor
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatBRL(calcResult.custoFornecedor)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Preco de venda</span>
                    <span className="font-semibold text-foreground">
                      {formatBRL(calcResult.precoVenda)}
                    </span>
                  </div>

                  <div className="my-1 border-t border-border" />

                  {/* Lucro - Big Highlight */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Lucro
                    </span>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        calcResult.lucro >= 0 ? "text-primary" : "text-destructive"
                      )}
                    >
                      {formatBRL(calcResult.lucro)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Margem</span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        calcResult.margem < 0
                          ? "text-destructive"
                          : calcResult.margem < 15
                            ? "text-[hsl(var(--warning))]"
                            : "text-primary"
                      )}
                    >
                      {formatPercent(calcResult.margem)}
                    </span>
                  </div>

                  {/* Alerts */}
                  {calcResult.precoVenda > 0 && calcResult.margem < 0 && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="font-medium">
                        Prejuizo! O preco de venda esta abaixo do custo.
                      </span>
                    </div>
                  )}

                  {calcResult.precoVenda > 0 &&
                    calcResult.margem >= 0 &&
                    calcResult.margem < 15 && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-[hsl(var(--warning))]/10 p-3 text-sm text-[hsl(var(--warning))]">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span className="font-medium">
                          Margem baixa! Considere aumentar o preco.
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {calcResult && calcResult.precoVenda > 0 && (
            <div className="mb-8 flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Orcamento
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
