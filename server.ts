import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getDb, hashPassword } from './server/database.ts';

dotenv.config({ quiet: true });

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for secure image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `car-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPG, JPEG, PNG e WebP são permitidos.'));
    }
  },
});

// In-memory active sessions cache (token -> { adminId, username, name, expiresAt })
const activeSessions = new Map<string, { adminId: number; username: string; name: string; expiresAt: number }>();

// Auth Middleware with SQLite persistence fallback
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Faça login para continuar.' });
  }
  const token = authHeader.substring(7);

  // 1. Check in-memory cache
  let session = activeSessions.get(token);

  // 2. If not in memory, check SQLite admin_sessions table
  if (!session || session.expiresAt < Date.now()) {
    try {
      const db = getDb();
      const row = db.prepare('SELECT * FROM admin_sessions WHERE token = ?').get(token) as any;
      if (row && row.expires_at > Date.now()) {
        session = {
          adminId: row.admin_id,
          username: row.username,
          name: row.name,
          expiresAt: row.expires_at,
        };
        activeSessions.set(token, session);
      } else if (row) {
        db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      }
    } catch (e) {
      console.error('Erro ao verificar sessão no banco:', e);
    }
  }

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
  }

  // Refresh expiration
  const newExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  session.expiresAt = newExpiration;
  try {
    const db = getDb();
    db.prepare('UPDATE admin_sessions SET expires_at = ? WHERE token = ?').run(newExpiration, token);
  } catch {}

  (req as any).admin = session;
  next();
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Authentication
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const db = getDb();
    const envAdminUser = (process.env.ADMIN_USER || 'JOTA1234').trim();
    const envAdminPass = (process.env.ADMIN_PASSWORD || 'JOTA1234').trim();

    // Check DB
    const admin = db.prepare('SELECT * FROM administrators WHERE LOWER(username) = LOWER(?)').get(username.trim()) as any;
    const inputHash = hashPassword(password);

    let authenticated = false;
    let adminRecord = admin;

    const matchesEnv = username.trim().toLowerCase() === envAdminUser.toLowerCase() && password === envAdminPass;

    if (matchesEnv) {
      authenticated = true;
      if (!admin) {
        db.prepare('INSERT INTO administrators (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
          username.trim(),
          inputHash,
          'Administrador',
          'admin'
        );
        adminRecord = db.prepare('SELECT * FROM administrators WHERE LOWER(username) = LOWER(?)').get(username.trim()) as any;
      } else {
        db.prepare('UPDATE administrators SET password_hash = ? WHERE id = ?').run(inputHash, admin.id);
        adminRecord = { ...admin, password_hash: inputHash };
      }
    } else if (admin && admin.password_hash === inputHash) {
      authenticated = true;
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const sessionData = {
      adminId: adminRecord?.id || 1,
      username: adminRecord?.username || username,
      name: adminRecord?.name || 'Administrador',
      expiresAt,
    };

    activeSessions.set(token, sessionData);

    // Save persistent session in SQLite
    try {
      db.prepare(`
        INSERT OR REPLACE INTO admin_sessions (token, admin_id, username, name, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(token, sessionData.adminId, sessionData.username, sessionData.name, expiresAt);
    } catch (errDb) {
      console.error('Erro ao gravar admin_sessions:', errDb);
    }

    res.json({
      success: true,
      token,
      user: {
        id: sessionData.adminId,
        username: sessionData.username,
        name: sessionData.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao processar login.' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
    try {
      const db = getDb();
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    } catch {}
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ user: (req as any).admin });
});

// 3. Vehicles API
app.get('/api/vehicles', (req, res) => {
  try {
    const db = getDb();
    const {
      search,
      marca,
      categoria,
      combustivel,
      cambio,
      condicao,
      status,
      em_oferta,
      destaque,
      precoMin,
      precoMax,
      anoMin,
      anoMax,
      sort,
      include_deleted,
    } = req.query;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params: any[] = [];

    if (include_deleted !== 'true') {
      query += ' AND is_deleted = 0';
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (marca LIKE ? OR modelo LIKE ? OR versao LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (marca) {
      query += ' AND marca = ?';
      params.push(marca);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (combustivel) {
      query += ' AND combustivel = ?';
      params.push(combustivel);
    }

    if (cambio) {
      query += ' AND cambio = ?';
      params.push(cambio);
    }

    if (condicao) {
      query += ' AND condicao = ?';
      params.push(condicao);
    }

    if (em_oferta === '1' || em_oferta === 'true') {
      query += ' AND em_oferta = 1';
    }

    if (destaque === '1' || destaque === 'true') {
      query += ' AND destaque = 1';
    }

    if (precoMin) {
      query += ' AND (CASE WHEN preco_promocional > 0 THEN preco_promocional ELSE preco END) >= ?';
      params.push(Number(precoMin));
    }

    if (precoMax) {
      query += ' AND (CASE WHEN preco_promocional > 0 THEN preco_promocional ELSE preco END) <= ?';
      params.push(Number(precoMax));
    }

    if (anoMin) {
      query += ' AND ano_modelo >= ?';
      params.push(Number(anoMin));
    }

    if (anoMax) {
      query += ' AND ano_modelo <= ?';
      params.push(Number(anoMax));
    }

    // Sorting
    switch (sort) {
      case 'preco_asc':
        query += ' ORDER BY (CASE WHEN preco_promocional > 0 THEN preco_promocional ELSE preco END) ASC';
        break;
      case 'preco_desc':
        query += ' ORDER BY (CASE WHEN preco_promocional > 0 THEN preco_promocional ELSE preco END) DESC';
        break;
      case 'km_asc':
        query += ' ORDER BY km ASC';
        break;
      case 'recentes':
        query += ' ORDER BY created_at DESC';
        break;
      case 'ano_desc':
        query += ' ORDER BY ano_modelo DESC';
        break;
      default:
        query += ' ORDER BY ordem ASC, id DESC';
    }

    const vehicles = db.prepare(query).all(...params) as any[];

    // Fetch images and features for each vehicle
    const enriched = vehicles.map((v) => {
      const images = db
        .prepare('SELECT url, is_cover, display_order FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_cover DESC, display_order ASC')
        .all(v.id) as any[];
      const features = db
        .prepare('SELECT feature_name FROM vehicle_features WHERE vehicle_id = ?')
        .all(v.id) as any[];

      const coverImage = images.find((img) => img.is_cover === 1)?.url || images[0]?.url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';

      return {
        ...v,
        cover_image: coverImage,
        images: images.map((img) => img.url),
        features: features.map((f) => f.feature_name),
      };
    });

    res.json({ vehicles: enriched, total: enriched.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vehicles/:id', (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as any;

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const images = db
      .prepare('SELECT id, url, is_cover, display_order FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_cover DESC, display_order ASC')
      .all(id) as any[];
    const features = db
      .prepare('SELECT id, feature_name FROM vehicle_features WHERE vehicle_id = ?')
      .all(id) as any[];

    // Find similar vehicles
    const similar = db
      .prepare(
        'SELECT id, marca, modelo, versao, preco, preco_promocional, ano_modelo, km, combustivel, cambio, condicao, status FROM vehicles WHERE id != ? AND is_deleted = 0 AND (categoria = ? OR marca = ?) LIMIT 3'
      )
      .all(id, vehicle.categoria, vehicle.marca) as any[];

    const enrichedSimilar = similar.map((s) => {
      const cover = db.prepare('SELECT url FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_cover DESC, display_order ASC LIMIT 1').get(s.id) as any;
      return {
        ...s,
        cover_image: cover?.url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      };
    });

    res.json({
      vehicle: {
        ...vehicle,
        images: images.map((img) => img.url),
        images_detailed: images,
        features: features.map((f) => f.feature_name),
        similar: enrichedSimilar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const {
      marca,
      modelo,
      versao,
      categoria,
      preco,
      preco_promocional,
      ano_fabricacao,
      ano_modelo,
      km,
      combustivel,
      cambio,
      cor,
      portas,
      placa_final,
      condicao,
      descricao,
      status,
      destaque,
      em_oferta,
      ordem,
      images,
      features,
    } = req.body;

    if (!marca || !modelo || !preco || !ano_modelo) {
      return res.status(400).json({ error: 'Marca, modelo, preço e ano são obrigatórios.' });
    }

    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (
        marca, modelo, versao, categoria, preco, preco_promocional,
        ano_fabricacao, ano_modelo, km, combustivel, cambio, cor,
        portas, placa_final, condicao, descricao, status, destaque,
        em_oferta, ordem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertVehicle.run(
      marca,
      modelo,
      versao || '',
      categoria || 'Sedan',
      Number(preco),
      Number(preco_promocional || 0),
      Number(ano_fabricacao || ano_modelo),
      Number(ano_modelo),
      Number(km || 0),
      combustivel || 'Flex',
      cambio || 'Automático',
      cor || 'Preto',
      Number(portas || 4),
      placa_final || '',
      condicao || 'Seminovo',
      descricao || '',
      status || 'disponivel',
      destaque ? 1 : 0,
      em_oferta ? 1 : 0,
      Number(ordem || 0)
    ) as any;

    const newVehicleId = Number(result.lastInsertRowid);

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      const insertImg = db.prepare('INSERT INTO vehicle_images (vehicle_id, url, is_cover, display_order) VALUES (?, ?, ?, ?)');
      images.forEach((url: string, index: number) => {
        if (url && url.trim()) {
          insertImg.run(newVehicleId, url.trim(), index === 0 ? 1 : 0, index + 1);
        }
      });
    } else {
      // Default placeholder image
      db.prepare('INSERT INTO vehicle_images (vehicle_id, url, is_cover, display_order) VALUES (?, ?, 1, 1)').run(
        newVehicleId,
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
      );
    }

    // Insert Features
    if (Array.isArray(features)) {
      const insertFeat = db.prepare('INSERT INTO vehicle_features (vehicle_id, feature_name) VALUES (?, ?)');
      features.forEach((feat: string) => {
        if (feat && feat.trim()) {
          insertFeat.run(newVehicleId, feat.trim());
        }
      });
    }

    res.status(201).json({ success: true, id: newVehicleId, message: 'Veículo cadastrado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const {
      marca,
      modelo,
      versao,
      categoria,
      preco,
      preco_promocional,
      ano_fabricacao,
      ano_modelo,
      km,
      combustivel,
      cambio,
      cor,
      portas,
      placa_final,
      condicao,
      descricao,
      status,
      destaque,
      em_oferta,
      ordem,
      images,
      features,
    } = req.body;

    const updateVehicle = db.prepare(`
      UPDATE vehicles SET
        marca = ?, modelo = ?, versao = ?, categoria = ?, preco = ?, preco_promocional = ?,
        ano_fabricacao = ?, ano_modelo = ?, km = ?, combustivel = ?, cambio = ?, cor = ?,
        portas = ?, placa_final = ?, condicao = ?, descricao = ?, status = ?, destaque = ?,
        em_oferta = ?, ordem = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateVehicle.run(
      marca,
      modelo,
      versao || '',
      categoria || 'Sedan',
      Number(preco),
      Number(preco_promocional || 0),
      Number(ano_fabricacao || ano_modelo),
      Number(ano_modelo),
      Number(km || 0),
      combustivel || 'Flex',
      cambio || 'Automático',
      cor || 'Preto',
      Number(portas || 4),
      placa_final || '',
      condicao || 'Seminovo',
      descricao || '',
      status || 'disponivel',
      destaque ? 1 : 0,
      em_oferta ? 1 : 0,
      Number(ordem || 0),
      id
    );

    // Update images if provided
    if (Array.isArray(images)) {
      db.prepare('DELETE FROM vehicle_images WHERE vehicle_id = ?').run(id);
      const insertImg = db.prepare('INSERT INTO vehicle_images (vehicle_id, url, is_cover, display_order) VALUES (?, ?, ?, ?)');
      images.forEach((url: string, index: number) => {
        if (url && url.trim()) {
          insertImg.run(id, url.trim(), index === 0 ? 1 : 0, index + 1);
        }
      });
    }

    // Update features if provided
    if (Array.isArray(features)) {
      db.prepare('DELETE FROM vehicle_features WHERE vehicle_id = ?').run(id);
      const insertFeat = db.prepare('INSERT INTO vehicle_features (vehicle_id, feature_name) VALUES (?, ?)');
      features.forEach((feat: string) => {
        if (feat && feat.trim()) {
          insertFeat.run(id, feat.trim());
        }
      });
    }

    res.json({ success: true, message: 'Veículo atualizado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Change vehicle status
app.patch('/api/vehicles/:id/status', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!['disponivel', 'reservado', 'vendido'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Escolha: disponivel, reservado ou vendido.' });
    }

    db.prepare('UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    res.json({ success: true, message: `Status alterado para ${status}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle highlight (destaque)
app.patch('/api/vehicles/:id/toggle-destaque', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    db.prepare('UPDATE vehicles SET destaque = CASE WHEN destaque = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
    res.json({ success: true, message: 'Destaque atualizado.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle offer (oferta)
app.patch('/api/vehicles/:id/toggle-oferta', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    db.prepare('UPDATE vehicles SET em_oferta = CASE WHEN em_oferta = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
    res.json({ success: true, message: 'Status de oferta atualizado.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate vehicle
app.post('/api/vehicles/:id/duplicate', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const original = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as any;

    if (!original) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const insert = db.prepare(`
      INSERT INTO vehicles (
        marca, modelo, versao, categoria, preco, preco_promocional,
        ano_fabricacao, ano_modelo, km, combustivel, cambio, cor,
        portas, placa_final, condicao, descricao, status, destaque,
        em_oferta, ordem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      original.marca,
      `${original.modelo} (Cópia)`,
      original.versao,
      original.categoria,
      original.preco,
      original.preco_promocional,
      original.ano_fabricacao,
      original.ano_modelo,
      original.km,
      original.combustivel,
      original.cambio,
      original.cor,
      original.portas,
      original.placa_final,
      original.condicao,
      original.descricao,
      'disponivel',
      0,
      original.em_oferta,
      original.ordem + 1
    ) as any;

    const newId = Number(result.lastInsertRowid);

    // Duplicate images
    const images = db.prepare('SELECT url, is_cover, display_order FROM vehicle_images WHERE vehicle_id = ?').all(id) as any[];
    const insertImg = db.prepare('INSERT INTO vehicle_images (vehicle_id, url, is_cover, display_order) VALUES (?, ?, ?, ?)');
    images.forEach((img) => insertImg.run(newId, img.url, img.is_cover, img.display_order));

    // Duplicate features
    const features = db.prepare('SELECT feature_name FROM vehicle_features WHERE vehicle_id = ?').all(id) as any[];
    const insertFeat = db.prepare('INSERT INTO vehicle_features (vehicle_id, feature_name) VALUES (?, ?)');
    features.forEach((feat) => insertFeat.run(newId, feat.feature_name));

    res.json({ success: true, id: newId, message: 'Veículo duplicado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Soft Delete or Permanent Delete
app.delete('/api/vehicles/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const permanent = req.query.permanent === 'true';

    if (permanent) {
      db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Veículo excluído permanentemente.' });
    }

    // Soft delete (can be recovered)
    db.prepare('UPDATE vehicles SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true, message: 'Veículo movido para lixeira.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Restore deleted vehicle
app.patch('/api/vehicles/:id/restore', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    db.prepare('UPDATE vehicles SET is_deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    res.json({ success: true, message: 'Veículo restaurado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Image Upload
app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Arquivo muito grande. O limite é 10MB.'
          : err.message || 'Erro ao enviar o arquivo.';
      return res.status(400).json({ error: message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }
      const publicUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, url: publicUrl, filename: req.file.filename });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro interno ao processar upload.' });
    }
  });
});

// Multiple image uploads
app.post('/api/upload-multiple', requireAdmin, (req, res) => {
  upload.array('images', 10)(req, res, (err: any) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'Um ou mais arquivos excedem o limite de 10MB.'
          : err.message || 'Erro ao enviar os arquivos.';
      return res.status(400).json({ error: message });
    }
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }
      const urls = files.map((f) => `/uploads/${f.filename}`);
      res.json({ success: true, urls });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro interno ao processar upload.' });
    }
  });
});

// 5. Services API
app.get('/api/services', (req, res) => {
  try {
    const db = getDb();
    const services = db.prepare('SELECT * FROM services WHERE ativo = 1 ORDER BY id ASC').all();
    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Contacts and Leads Form Submissions
app.post('/api/contacts', (req, res) => {
  try {
    const db = getDb();
    const { tipo, nome, telefone, email, veiculo_id, veiculo_nome, valor_entrada, parcelas, veiculo_troca, mensagem } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    }

    // Basic protection against accidental double-clicks within 2 seconds
    const checkDuplicate = db
      .prepare("SELECT id FROM contacts WHERE telefone = ? AND mensagem = ? AND created_at >= datetime('now', '-2 seconds')")
      .get(telefone, mensagem || '');

    if (checkDuplicate) {
      return res.status(200).json({ success: true, message: 'Solicitação já registrada com sucesso!' });
    }

    const insert = db.prepare(`
      INSERT INTO contacts (
        tipo, nome, telefone, email, veiculo_id, veiculo_nome,
        valor_entrada, parcelas, veiculo_troca, mensagem, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'novo')
    `);

    const result = insert.run(
      tipo || 'contato',
      nome,
      telefone,
      email || '',
      veiculo_id ? Number(veiculo_id) : null,
      veiculo_nome || '',
      Number(valor_entrada || 0),
      Number(parcelas || 0),
      veiculo_troca || '',
      mensagem || ''
    ) as any;

    res.status(201).json({
      success: true,
      id: Number(result.lastInsertRowid),
      message: 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin list contacts
app.get('/api/contacts', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json({ contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/contacts/:id/status', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const { status } = req.body;
    db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: 'Status atualizado.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Contato excluído.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Company Settings API
app.get('/api/config', (req, res) => {
  try {
    const db = getDb();
    const config = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();
    res.json({ config });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/config', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const {
      nome,
      slogan,
      logo_url,
      cor_destaque,
      telefone,
      whatsapp,
      email,
      endereco,
      cidade_estado,
      horario_atendimento,
      instagram,
      facebook,
      banner_titulo,
      banner_subtitulo,
      banner_imagem,
      sobre_historia,
      sobre_missao,
      sobre_valores,
      sobre_diferenciais,
      metric_carros_vendidos,
      metric_anos_experiencia,
      metric_clientes_atendidos,
      metric_satisfacao,
    } = req.body;

    const update = db.prepare(`
      UPDATE company_settings SET
        nome = ?, slogan = ?, logo_url = ?, cor_destaque = ?, telefone = ?, whatsapp = ?,
        email = ?, endereco = ?, cidade_estado = ?, horario_atendimento = ?, instagram = ?,
        facebook = ?, banner_titulo = ?, banner_subtitulo = ?, banner_imagem = ?,
        sobre_historia = ?, sobre_missao = ?, sobre_valores = ?, sobre_diferenciais = ?,
        metric_carros_vendidos = ?, metric_anos_experiencia = ?, metric_clientes_atendidos = ?, metric_satisfacao = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    update.run(
      nome,
      slogan,
      logo_url || '',
      cor_destaque || '#d97706',
      telefone || '',
      whatsapp || '',
      email || '',
      endereco || '',
      cidade_estado || '',
      horario_atendimento || '',
      instagram || '',
      facebook || '',
      banner_titulo || '',
      banner_subtitulo || '',
      banner_imagem || '',
      sobre_historia || '',
      sobre_missao || '',
      sobre_valores || '',
      sobre_diferenciais || '',
      metric_carros_vendidos || '',
      metric_anos_experiencia || '',
      metric_clientes_atendidos || '',
      metric_satisfacao || ''
    );

    res.json({ success: true, message: 'Configurações atualizadas com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Admin Dashboard Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const totalVeiculos = (db.prepare("SELECT count(*) as total FROM vehicles WHERE is_deleted = 0").get() as any).total;
    const disponiveis = (db.prepare("SELECT count(*) as total FROM vehicles WHERE status = 'disponivel' AND is_deleted = 0").get() as any).total;
    const vendidos = (db.prepare("SELECT count(*) as total FROM vehicles WHERE status = 'vendido' AND is_deleted = 0").get() as any).total;
    const reservados = (db.prepare("SELECT count(*) as total FROM vehicles WHERE status = 'reservado' AND is_deleted = 0").get() as any).total;
    const ofertas = (db.prepare("SELECT count(*) as total FROM vehicles WHERE em_oferta = 1 AND is_deleted = 0").get() as any).total;
    const totalContatos = (db.prepare('SELECT count(*) as total FROM contacts').get() as any).total;
    const novosContatos = (db.prepare("SELECT count(*) as total FROM contacts WHERE status = 'novo'").get() as any).total;

    const ultimosVeiculos = db.prepare('SELECT id, marca, modelo, versao, preco, status, created_at FROM vehicles WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 5').all();
    const ultimosContatos = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      stats: {
        total_veiculos: totalVeiculos,
        totalVeiculos,
        disponiveis,
        veiculos_disponiveis: disponiveis,
        vendidos,
        veiculos_vendidos: vendidos,
        reservados,
        veiculos_reservados: reservados,
        ofertas,
        veiculos_oferta: ofertas,
        totalContatos,
        total_contatos: totalContatos,
        novosContatos,
        contatos_novos: novosContatos,
      },
      ultimosVeiculos,
      ultimosContatos,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SEO routes: robots.txt and sitemap.xml
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  try {
    const db = getDb();
    const vehicles = db.prepare("SELECT id, updated_at FROM vehicles WHERE is_deleted = 0 AND status = 'disponivel'").all() as any[];
    const host = `${req.protocol}://${req.get('host')}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${host}/</loc><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${host}/#catalogo</loc><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${host}/#sobre</loc><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${host}/#servicos</loc><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${host}/#contato</loc><priority>0.8</priority></url>\n`;

    vehicles.forEach((v) => {
      xml += `  <url><loc>${host}/#veiculo/${v.id}</loc><lastmod>${(v.updated_at || '').split(' ')[0] || '2026-09-08'}</lastmod><priority>0.8</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.type('application/xml');
    res.send(xml);
  } catch (error: any) {
    res.status(500).send('Error generating sitemap');
  }
});

// -------------------------------------------------------------
// Fallback JSON handlers: guarantee /api/* NEVER returns HTML/empty body
// -------------------------------------------------------------

// Unknown API route -> JSON 404 (instead of falling through to the SPA/HTML handler)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada.' });
});

// Global error handler -> guarantees JSON even for body-parser (payload too large),
// multer, or any other uncaught error thrown inside a route.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err?.status || err?.statusCode || 500;
  const message =
    err?.type === 'entity.too.large'
      ? 'O arquivo/dado enviado é muito grande.'
      : err?.message || 'Erro interno do servidor.';
  res.status(status).json({ error: message });
});

// -------------------------------------------------------------
// Vite Middleware setup for full-stack SPA
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoPrime server running on http://localhost:${PORT}`);
  });
}

startServer();
