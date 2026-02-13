export interface Produto {
  id: string
  nome: string
  custo_m2: number
  material: string | null
  cor: string | null
  observacoes: string | null
  custo_fixo: number
  created_at: string
  tamanhos?: Tamanho[]
  acabamentos?: Acabamento[]
  tipos_material?: TipoMaterial[]
}

export interface Tamanho {
  id: string
  produto_id: string
  largura_mm: number
  altura_mm: number
  label: string
}

export interface Acabamento {
  id: string
  produto_id: string
  nome: string
  custo: number
}

export interface TipoMaterial {
  id: string
  produto_id: string
  nome: string
}

export interface Calculo {
  id: string
  produto_id: string | null
  tamanho_label: string | null
  largura_mm: number | null
  altura_mm: number | null
  m2: number | null
  custo_fornecedor: number | null
  preco_venda: number | null
  lucro: number | null
  margem_percent: number | null
  acabamentos_selecionados: Record<string, number> | null
  tipo_material: string | null
  cliente_nome: string | null
  created_at: string
  produtos?: Produto
}
