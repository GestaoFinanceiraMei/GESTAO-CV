-- Create tables for the product management system (no auth, open access)

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  custo_m2 NUMERIC NOT NULL,
  material TEXT,
  cor TEXT,
  observacoes TEXT,
  custo_fixo NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tamanhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  largura_mm NUMERIC NOT NULL,
  altura_mm NUMERIC NOT NULL,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS acabamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  custo NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS tipos_material (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  tamanho_label TEXT,
  largura_mm NUMERIC,
  altura_mm NUMERIC,
  m2 NUMERIC,
  custo_fornecedor NUMERIC,
  preco_venda NUMERIC,
  lucro NUMERIC,
  margem_percent NUMERIC,
  acabamentos_selecionados JSONB,
  tipo_material TEXT,
  cliente_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS but allow all access (no auth)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamanhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE acabamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;

-- Open policies for all tables (no authentication required)
CREATE POLICY "allow_all_produtos" ON produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tamanhos" ON tamanhos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_acabamentos" ON acabamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tipos_material" ON tipos_material FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_calculos" ON calculos FOR ALL USING (true) WITH CHECK (true);
