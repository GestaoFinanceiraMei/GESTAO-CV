-- Seed initial products

-- 1. Adesivo e Lona
INSERT INTO produtos (id, nome, custo_m2, material, cor, observacoes, custo_fixo)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Adesivo e Lona', 85.00, NULL, NULL, 'Campo livre de tamanho', 0);

INSERT INTO tipos_material (produto_id, nome) VALUES
('a1000000-0000-0000-0000-000000000001', 'Vinil Brilho'),
('a1000000-0000-0000-0000-000000000001', 'Vinil Fosco'),
('a1000000-0000-0000-0000-000000000001', 'Laminado Transparente'),
('a1000000-0000-0000-0000-000000000001', 'Vinil Transparente c/Adesivo Branco'),
('a1000000-0000-0000-0000-000000000001', 'Invertido'),
('a1000000-0000-0000-0000-000000000001', 'Invertido e Laminado'),
('a1000000-0000-0000-0000-000000000001', 'Somente Adesivo');

-- 2. Banners e Faixas
INSERT INTO produtos (id, nome, custo_m2, material, cor, observacoes, custo_fixo)
VALUES ('a2000000-0000-0000-0000-000000000002', 'Banners e Faixas', 85.00, 'Lona 280g 4x0', '4x0', NULL, 0);

INSERT INTO tamanhos (produto_id, largura_mm, altura_mm, label) VALUES
('a2000000-0000-0000-0000-000000000002', 300, 400, '300x400mm'),
('a2000000-0000-0000-0000-000000000002', 300, 600, '300x600mm'),
('a2000000-0000-0000-0000-000000000002', 400, 600, '400x600mm'),
('a2000000-0000-0000-0000-000000000002', 600, 900, '600x900mm'),
('a2000000-0000-0000-0000-000000000002', 600, 1000, '600x1000mm'),
('a2000000-0000-0000-0000-000000000002', 800, 1200, '800x1200mm');

INSERT INTO acabamentos (produto_id, nome, custo) VALUES
('a2000000-0000-0000-0000-000000000002', 'Madeira', 10.00),
('a2000000-0000-0000-0000-000000000002', 'Ilhos', 10.00),
('a2000000-0000-0000-0000-000000000002', 'Ambos (Madeira + Ilhos)', 20.00);

-- 3. Backdrop
INSERT INTO produtos (id, nome, custo_m2, material, cor, observacoes, custo_fixo)
VALUES ('a3000000-0000-0000-0000-000000000003', 'Backdrop', 85.00, NULL, NULL, 'Ilhos ja incluso no custo fixo', 50.00);

-- 4. Papel de Parede
INSERT INTO produtos (id, nome, custo_m2, material, cor, observacoes, custo_fixo)
VALUES ('a4000000-0000-0000-0000-000000000004', 'Papel de Parede', 85.00, NULL, '4x0, sem verniz', NULL, 0);

INSERT INTO tipos_material (produto_id, nome) VALUES
('a4000000-0000-0000-0000-000000000004', 'Vinil Brilho'),
('a4000000-0000-0000-0000-000000000004', 'Vinil Fosco'),
('a4000000-0000-0000-0000-000000000004', 'Vinil Transparente'),
('a4000000-0000-0000-0000-000000000004', 'Invertido'),
('a4000000-0000-0000-0000-000000000004', 'Invertido e Laminado c/Adesivo Branco'),
('a4000000-0000-0000-0000-000000000004', 'Somente Adesivo'),
('a4000000-0000-0000-0000-000000000004', 'Adesivo Brilho Laminado com Transparente');

INSERT INTO tamanhos (produto_id, largura_mm, altura_mm, label) VALUES
('a4000000-0000-0000-0000-000000000004', 580, 1000, '58x100cm'),
('a4000000-0000-0000-0000-000000000004', 580, 1500, '58x150cm'),
('a4000000-0000-0000-0000-000000000004', 580, 2000, '58x200cm'),
('a4000000-0000-0000-0000-000000000004', 580, 2500, '58x250cm'),
('a4000000-0000-0000-0000-000000000004', 580, 3000, '58x300cm'),
('a4000000-0000-0000-0000-000000000004', 580, 3500, '58x350cm'),
('a4000000-0000-0000-0000-000000000004', 580, 4000, '58x400cm'),
('a4000000-0000-0000-0000-000000000004', 580, 4500, '58x450cm');

-- 5. Etiquetas e Rotulos
INSERT INTO produtos (id, nome, custo_m2, material, cor, observacoes, custo_fixo)
VALUES ('a5000000-0000-0000-0000-000000000005', 'Etiquetas e Rotulos', 95.00, NULL, '4x0', NULL, 0);

INSERT INTO tamanhos (produto_id, largura_mm, altura_mm, label) VALUES
('a5000000-0000-0000-0000-000000000005', 30, 30, '30x30mm'),
('a5000000-0000-0000-0000-000000000005', 40, 40, '40x40mm'),
('a5000000-0000-0000-0000-000000000005', 50, 50, '50x50mm'),
('a5000000-0000-0000-0000-000000000005', 60, 60, '60x60mm'),
('a5000000-0000-0000-0000-000000000005', 70, 70, '70x70mm'),
('a5000000-0000-0000-0000-000000000005', 80, 80, '80x80mm'),
('a5000000-0000-0000-0000-000000000005', 90, 90, '90x90mm'),
('a5000000-0000-0000-0000-000000000005', 100, 100, '100x100mm');
