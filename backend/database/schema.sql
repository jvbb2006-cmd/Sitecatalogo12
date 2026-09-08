-- SQLite Schema para Concessionária de Veículos
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS administrators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    versao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    preco REAL NOT NULL,
    preco_promocional REAL DEFAULT 0,
    ano_fabricacao INTEGER NOT NULL,
    ano_modelo INTEGER NOT NULL,
    km INTEGER NOT NULL,
    combustivel TEXT NOT NULL,
    cambio TEXT NOT NULL,
    cor TEXT NOT NULL,
    portas INTEGER DEFAULT 4,
    placa_final TEXT,
    condicao TEXT NOT NULL, -- 'Novo', 'Seminovo'
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'reservado', 'vendido'
    destaque INTEGER DEFAULT 0,
    em_oferta INTEGER DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_cover INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    feature_name TEXT NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    icone_tipo TEXT NOT NULL,
    link_texto TEXT NOT NULL,
    ativo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL, -- 'contato', 'financiamento', 'avaliacao_usado', 'agendamento_visita', 'test_drive'
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    veiculo_id INTEGER,
    veiculo_nome TEXT,
    valor_entrada REAL DEFAULT 0,
    parcelas INTEGER DEFAULT 0,
    veiculo_troca TEXT,
    mensagem TEXT,
    status TEXT DEFAULT 'novo', -- 'novo', 'em_atendimento', 'concluido'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nome TEXT NOT NULL,
    slogan TEXT,
    logo_url TEXT,
    cor_destaque TEXT DEFAULT '#d97706',
    telefone TEXT,
    whatsapp TEXT,
    email TEXT,
    endereco TEXT,
    cidade_estado TEXT,
    horario_atendimento TEXT,
    instagram TEXT,
    facebook TEXT,
    banner_titulo TEXT,
    banner_subtitulo TEXT,
    banner_imagem TEXT,
    sobre_historia TEXT,
    sobre_missao TEXT,
    sobre_valores TEXT,
    sobre_diferenciais TEXT,
    metric_carros_vendidos TEXT,
    metric_anos_experiencia TEXT,
    metric_clientes_atendidos TEXT,
    metric_satisfacao TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
