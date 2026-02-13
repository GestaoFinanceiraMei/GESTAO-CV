"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calculator, Package, TrendingUp, DollarSign, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatBRL } from "@/lib/format"
import type { Produto, Calculo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import useSWR from "swr"

async function fetchDashboardData() {
  const supabase = createClient()

  const [produtosRes, calculosRes] = await Promise.all([
    supabase
      .from("produtos")
      .select("*, tamanhos(*), acabamentos(*), tipos_material(*)")
      .order("created_at", { ascending: true }),
    supabase
      .from("calculos")
      .select("*")
      .gte(
        "created_at",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      )
      .order("created_at", { ascending: false }),
  ])

  return {
    produtos: (produtosRes.data as Produto[]) || [],
    calculos: (calculosRes.data as Calculo[]) || [],
  }
}

export function DashboardContent() {
  const { data, isLoading } = useSWR("dashboard", fetchDashboardData, {
    revalidateOnFocus: true,
  })

  const produtos = data?.produtos || []
  const calculos = data?.calculos || []

  const totalOrcamentos = calculos.length
  const receitaEstimada = calculos.reduce(
    (sum, c) => sum + (c.preco_venda || 0),
    0
  )
  const lucroEstimado = calculos.reduce((sum, c) => sum + (c.lucro || 0), 0)

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          CalcPrint
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestao de produtos e orcamentos
        </p>
      </header>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Orcamentos</span>
            </div>
            <p className="mt-1 text-xl font-bold text-foreground">
              {isLoading ? "-" : totalOrcamentos}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Receita</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">
              {isLoading ? "-" : formatBRL(receitaEstimada)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Lucro</span>
            </div>
            <p className="mt-1 text-lg font-bold text-primary">
              {isLoading ? "-" : formatBRL(lucroEstimado)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Cards */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Produtos</h2>
        <Button asChild size="sm" variant="outline">
          <Link href="/produtos/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card">
              <CardContent className="p-4">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="mt-2 h-4 w-20 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {produtos.map((produto) => (
            <Card
              key={produto.id}
              className="bg-card transition-colors hover:bg-accent"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {produto.nome}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatBRL(produto.custo_m2)}/m2</span>
                      {produto.tamanhos && produto.tamanhos.length > 0 && (
                        <span>
                          {produto.tamanhos.length} tamanho
                          {produto.tamanhos.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {produto.material && <span>{produto.material}</span>}
                    </div>
                    {produto.observacoes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {produto.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/produtos/${produto.id}`}>Editar</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/calculadora?produto=${produto.id}`}>
                        <Calculator className="mr-1 h-4 w-4" />
                        Calcular
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
