-- DADOS DE EXEMPLO (DEMONSTRATIVOS)
-- Nota: Estes dados são fictícios para fins de apresentação e demonstração da plataforma.

-- Senha padrão para admin: 'JOTA1234' (hash SHA-256: 1a72579e67bb03bfceaba0e999feb4883bab8e9b03f84286313cd98052267090)
INSERT OR REPLACE INTO administrators (id, username, password_hash, name, role)
VALUES (1, 'JOTA1234', '1a72579e67bb03bfceaba0e999feb4883bab8e9b03f84286313cd98052267090', 'Administrador Principal', 'admin');

-- Configurações da Empresa
INSERT OR REPLACE INTO company_settings (
    id, nome, slogan, logo_url, cor_destaque, telefone, whatsapp, email, endereco, cidade_estado, horario_atendimento,
    instagram, facebook, banner_titulo, banner_subtitulo, banner_imagem,
    sobre_historia, sobre_missao, sobre_valores, sobre_diferenciais,
    metric_carros_vendidos, metric_anos_experiencia, metric_clientes_atendidos, metric_satisfacao
) VALUES (
    1,
    'AutoPrime Motors',
    'Excelência e transparência em veículos premium novos e seminovos.',
    '',
    '#d97706',
    '(11) 3456-7890',
    '5511999998888',
    'contato@autoprimemotors.com.br',
    'Avenida Europa, 1420 - Jardins',
    'São Paulo - SP, 01449-001',
    'Segunda a Sexta: 08h às 19h | Sábados: 09h às 16h',
    '@autoprimemotors',
    'facebook.com/autoprimemotors',
    'Seu próximo carro está aqui.',
    'Veículos selecionados, atendimento especializado e as melhores condições para você dirigir uma nova história.',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    'Fundada com a proposta de redefinir o mercado automotivo premium, a AutoPrime nasceu do entusiasmo por automóveis de alta performance e da busca incessante pela máxima transparência.',
    'Proporcionar aos nossos clientes a melhor experiência na aquisição de veículos, unindo segurança documental, garantia de procedência e atendimento humanizado.',
    'Ética inegociável, transparência em cada laudo cautelar, paixão por automóveis e excelência contínua no pós-venda.',
    '100% dos veículos com laudo cautelar aprovado sem restrições, garantia estendida de 1 ano, entrega para todo o Brasil e avaliação justa do seu usado.',
    '1.850+ [Valor editável no painel]',
    '15 anos [Valor editável no painel]',
    '2.400+ [Valor editável no painel]',
    '99.4% [Valor editável no painel]'
);

-- Serviços Oferecidos
INSERT OR IGNORE INTO services (id, titulo, descricao, icone_tipo, link_texto, ativo) VALUES
(1, 'Compra e Venda de Veículos', 'Curadoria rigorosa de veículos seminovos com laudo cautelar completo e procedência 100% garantida.', 'car', 'Quero comprar ou vender', 1),
(2, 'Financiamento Personalizado', 'Taxas competitivas com os principais bancos e financeiras do país, com aprovação ágil e transparente.', 'finance', 'Simular financiamento', 1),
(3, 'Avaliação de Veículo Usado', 'Avaliação técnica justa e valorização máxima do seu veículo como parte do pagamento na troca.', 'check', 'Avaliar meu carro', 1),
(4, 'Troca com Troco', 'Substitua seu carro por um modelo de menor valor e receba a diferença em dinheiro na sua conta.', 'shield', 'Consultar condições', 1),
(5, 'Consignação Segura', 'Venda seu veículo com toda segurança em nosso showroom físico e canais digitais sem se preocupar.', 'star', 'Quero consignar', 1),
(6, 'Documentação e Despachante', 'Assessoria completa em transferência, emissão de documentos e vistorias sem burocracia.', 'shield', 'Falar com despachante', 1),
(7, 'Seguro Automóvel', 'Parceria com as maiores seguradoras do mercado para garantir a melhor proteção para o seu novo carro.', 'shield', 'Cotar seguro', 1),
(8, 'Agendamento de Test-Drive', 'Experimente a dirigibilidade e o conforto do veículo desejado com acompanhamento exclusivo.', 'test-drive', 'Agendar test-drive', 1);

-- Veículos Demonstrativos (Fictícios)
INSERT OR REPLACE INTO vehicles (id, marca, modelo, versao, categoria, preco, preco_promocional, ano_fabricacao, ano_modelo, km, combustivel, cambio, cor, portas, placa_final, condicao, descricao, status, destaque, em_oferta, ordem, is_deleted)
VALUES
(1, 'Porsche', '911 Carrera S', '3.0 Turbo 450cv PDK', 'Cupê', 890000.0, 869000.0, 2023, 2023, 8500, 'Gasolina', 'Automático', 'Cinza Giz', 2, '9', 'Seminovo', 'Exemplar em estado impecável de conservação. Pacote Sport Chrono, escapamento esportivo original com seletor de som, teto solar elétrico em vidro, bancos esportivos adaptativos de 18 vias com memória e brasão Porsche nos encostos de cabeça. Rodas Carrera Classic 20/21 polegadas, faróis em LED Matrix com PDLS Plus. Veículo revisado em concessionária autorizada e garantia estendida.', 'disponivel', 1, 1, 1, 0),

(2, 'BMW', 'M3 Competition', '3.0 Bi-Turbo 510cv M Steptronic', 'Sedan', 785000.0, 0, 2024, 2024, 4200, 'Gasolina', 'Automático', 'Azul Portimão', 4, '3', 'Seminovo', 'Sedan de altíssima performance. Motor 6 cilindros em linha TwinPower Turbo com 510 cv de potência. Bancos M Carbon com aquecimento, acabamento interno em fibra de carbono, BMW Live Cockpit Professional curvo com sistema iDrive 8, freios M de composto cerâmico. Único dono, blindagem Nível III-A com vidros AGP B33.', 'disponivel', 1, 0, 2, 0),

(3, 'Mercedes-Benz', 'GLC 300 4MATIC', '2.0 Turbo 258cv AMG Line Mild Hybrid', 'SUV', 469000.0, 449900.0, 2024, 2024, 12000, 'Híbrido', 'Automático', 'Preto Obsidian', 4, '7', 'Seminovo', 'O SUV de luxo definitivo da estrela. Pacote estético AMG Line completo, teto solar panorâmico corrediço, painel digital de 12.3 polegadas e tela central multimídia de 11.9 polegadas com Apple CarPlay e Android Auto sem fio. Sistema de som Surround Burmester 3D, tração integral permanente 4MATIC e faróis Digital Light com projeção.', 'disponivel', 1, 1, 3, 0),

(4, 'Audi', 'RS6 Avant', '4.0 V8 Bi-Turbo 600cv Tiptronic Quattro', 'Perua', 980000.0, 0, 2023, 2023, 14800, 'Gasolina', 'Automático', 'Cinza Nardo', 4, '5', 'Seminovo', 'A perua mais icônica do automobilismo mundial. Aceleração de 0 a 100 km/h em apenas 3,6 segundos. Sistema Quattro permanente com diferencial traseiro esportivo, rodas aro 22 com acabamento diamantado, interior em couro Valcona com costuras contrastantes em vermelho RS, teto solar panorâmico e sistema de som Bang & Olufsen Advanced 3D.', 'disponivel', 1, 0, 4, 0),

(5, 'Land Rover', 'Defender 110 HSE', '3.0 D300 Turbo Diesel MHEV', 'SUV', 620000.0, 599000.0, 2023, 2024, 21000, 'Diesel', 'Automático', 'Verde Pangea', 4, '2', 'Seminovo', 'Capacidade off-road lendária combinada com o mais alto padrão de sofisticação britânica. Suspensão pneumática adaptativa com controle dinâmico, teto panorâmico, sistema de câmeras 360° com visão de solo, som Meridian Surround, bancos dianteiros climatizados e 7 lugares. Laudo 100% aprovado.', 'disponivel', 0, 1, 5, 0),

(6, 'Toyota', 'Corolla Cross XRX', '1.8 16V Híbrido Flex Automático', 'SUV', 198000.0, 0, 2024, 2025, 0, 'Híbrido', 'CVT', 'Branco Lunar', 4, '0', 'Novo', 'Veículo 0 km pronta entrega com faturamento imediato. Sistema híbrido flex com máxima eficiência de combustível (faz até 18 km/l na cidade). Pacote de segurança ativa Toyota Safety Sense (piloto automático adaptativo, frenagem autônoma de emergência e assistente de permanência em faixa). Garantia de fábrica de 5 anos.', 'disponivel', 1, 0, 6, 0),

(7, 'Ford', 'Mustang GT', '5.0 V8 483cv Mach 1 Automático', 'Cupê', 495000.0, 0, 2022, 2022, 16500, 'Gasolina', 'Automático', 'Laranja Twister', 2, '8', 'Seminovo', 'Muscle car lendário em edição Mach 1. Motor Coyote V8 5.0 aspirado com ronco inconfundível. Sistema de amortecimento MagneRide com ajuste magnético em tempo real, freios Brembo com pinças de alta performance, escape ativo com 4 modos sonoros. Carro de colecionador, impecável.', 'reservado', 0, 0, 7, 0),

(8, 'Volvo', 'XC60 T8 Recharge', '2.0 Turbo Híbrido Plug-in 462cv AWD Plus', 'SUV', 389000.0, 0, 2023, 2023, 28000, 'Híbrido', 'Automático', 'Prata Cristal', 4, '4', 'Seminovo', 'Segurança escandinava com potência esportiva e alta economia. Autonomia elétrica de até 78 km no modo Pure. Central multimídia nativa Google com Google Maps e Play Store integrados, teto panorâmico, piloto automático adaptativo com Pilot Assist, sistema de purificação de ar CleanZone.', 'vendido', 0, 0, 8, 0);

-- Imagens dos Veículos
INSERT OR REPLACE INTO vehicle_images (id, vehicle_id, url, is_cover, display_order) VALUES
-- Porsche 911
(1, 1, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 1, 1),
(2, 1, 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80', 0, 2),
(3, 1, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 0, 3),

-- BMW M3
(4, 2, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 1, 1),
(5, 2, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', 0, 2),

-- Mercedes-Benz GLC 300
(6, 3, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 1, 1),
(7, 3, 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=80', 0, 2),

-- Audi RS6 Avant
(8, 4, 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80', 1, 1),
(9, 4, 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80', 0, 2),

-- Land Rover Defender
(10, 5, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', 1, 1),
(11, 5, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 0, 2),

-- Toyota Corolla Cross
(12, 6, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 1, 1),

-- Ford Mustang GT
(13, 7, 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80', 1, 1),

-- Volvo XC60
(14, 8, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80', 1, 1);

-- Opcionais dos Veículos
INSERT OR REPLACE INTO vehicle_features (vehicle_id, feature_name) VALUES
(1, 'Pacote Sport Chrono'),
(1, 'Escapamento Esportivo com Seletor'),
(1, 'Teto Solar em Vidro Elétrico'),
(1, 'Bancos Adaptativos 18 Vias com Memória'),
(1, 'Faróis LED Matrix com PDLS Plus'),
(1, 'Sistema de Som Bose Surround'),
(1, 'Controle de Tração e Estabilidade PSM'),
(1, 'Rodas Carrera Classic 20/21'),

(2, 'Bancos Esportivos M Carbon'),
(2, 'Freios M Cerâmica de Alta Performance'),
(2, 'BMW Live Cockpit Professional Curvo'),
(2, 'Blindagem Nível III-A AGP B33'),
(2, 'Head-Up Display Colorido'),
(2, 'Câmera 360 Graus com Assistente'),
(2, 'Acabamento Interno em Fibra de Carbono'),

(3, 'Pacote Estético AMG Line'),
(3, 'Teto Solar Panorâmico Elétrico'),
(3, 'Sistema de Som Burmester 3D'),
(3, 'Tração Integral Permanente 4MATIC'),
(3, 'Faróis Digital Light'),
(3, 'Apple CarPlay e Android Auto Sem Fio'),
(3, 'Carregador por Indução'),

(4, 'Tração Integral Quattro com Diferencial Esportivo'),
(4, 'Rodas Aro 22 Diamantadas'),
(4, 'Bancos em Couro Valcona com Logo RS'),
(4, 'Som Bang & Olufsen Advanced 3D'),
(4, 'Suspensão a Ar Adaptativa RS'),
(4, 'Piloto Automático Adaptativo com Stop&Go'),

(5, 'Suspensão Pneumática Eletrônica'),
(5, 'Configuração de 7 Lugares'),
(5, 'Câmeras 360 com Visão 3D e Solo'),
(5, 'Som Meridian Surround 400W'),
(5, 'Tração 4x4 com Terrain Response 2'),

(6, 'Pacote Toyota Safety Sense Completo'),
(6, 'Faróis Full LED com Acendimento Automático'),
(6, 'Ar-Condicionado Digital Dual Zone'),
(6, 'Piloto Automático Adaptativo'),
(6, '7 Airbags (Frontais, Laterais, Cortina e Joelho)');
