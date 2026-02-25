import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import fs from "fs";
import { fetch as nodeFetch } from "undici";
import * as cheerio from "cheerio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database("runnerpro.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    plan TEXT DEFAULT 'Starter',
    role TEXT DEFAULT 'user',
    status_pagamento TEXT DEFAULT 'Pendente'
  );

  CREATE TABLE IF NOT EXISTS raffles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product TEXT,
    description TEXT,
    value_number REAL,
    total_numbers INTEGER,
    sold_numbers INTEGER DEFAULT 0,
    draw_date TEXT,
    status TEXT DEFAULT 'Ativo',
    image_url TEXT,
    image_path TEXT,
    thumbnail_url TEXT
  );

  CREATE TABLE IF NOT EXISTS catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT,
    image_path TEXT,
    preview_blur_url TEXT,
    prompt TEXT,
    description TEXT,
    category TEXT,
    style TEXT,
    min_plan TEXT DEFAULT 'Starter',
    status TEXT DEFAULT 'Ativo',
    created_by TEXT
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    content TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS user_nutrition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    meal TEXT,
    time TEXT,
    description TEXT,
    calories INTEGER,
    observation TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price TEXT,
    original_price TEXT,
    category TEXT,
    link TEXT,
    image_url TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS midias_motivacionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    titulo TEXT,
    categoria TEXT,
    sinopse TEXT,
    plataforma TEXT,
    ano INTEGER,
    imagem_url TEXT,
    link_externo TEXT,
    criado_por TEXT,
    status TEXT DEFAULT 'pendente',
    aprovado_por_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS recommended_professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    instagram TEXT,
    foto_url TEXT,
    foto_path TEXT,
    active INTEGER DEFAULT 1
  );
`);

// Migration to add missing columns if they don't exist
const tablesToMigrate = {
  raffles: [
    { name: 'description', type: 'TEXT' },
    { name: 'draw_date', type: 'TEXT' },
    { name: 'image_url', type: 'TEXT' },
    { name: 'image_path', type: 'TEXT' },
    { name: 'thumbnail_url', type: 'TEXT' }
  ],
  catalog: [
    { name: 'title', type: 'TEXT' },
    { name: 'image_path', type: 'TEXT' },
    { name: 'preview_blur_url', type: 'TEXT' },
    { name: 'description', type: 'TEXT' },
    { name: 'style', type: 'TEXT' },
    { name: 'min_plan', type: 'TEXT DEFAULT "Starter"' },
    { name: 'status', type: 'TEXT DEFAULT "Ativo"' }
  ],
  recommended_professionals: [
    { name: 'foto_url', type: 'TEXT' },
    { name: 'foto_path', type: 'TEXT' }
  ],
  users: [
    { name: 'role', type: 'TEXT DEFAULT "user"' }
  ]
};

for (const [table, columns] of Object.entries(tablesToMigrate)) {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  const existingColumns = info.map((col: any) => col.name);
  for (const col of columns) {
    if (!existingColumns.includes(col.name)) {
      try {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`).run();
        console.log(`Added column ${col.name} to table ${table}`);
      } catch (e) {
        console.error(`Error adding column ${col.name} to ${table}:`, e);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  
  // Serve static files from public
  app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Upload Endpoint (Simulating Cloud Storage)
  app.post("/api/upload", (req, res) => {
    const { base64, filename, type } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: "Missing data" });
    }

    try {
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const extension = filename.split('.').pop();
      const newFilename = `${type || 'upload'}_${Date.now()}.${extension}`;
      const filePath = path.join(uploadsDir, newFilename);
      
      fs.writeFileSync(filePath, buffer);
      
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const fileUrl = `${appUrl}/uploads/${newFilename}`;
      
      res.json({ 
        url: fileUrl,
        path: `/uploads/${newFilename}`
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Simple User Mock for Demo
  app.get("/api/user/me", (req, res) => {
    // In a real app, this would use session/cookies
    // For this demo, we'll look for the admin user first
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get("bruno.gju@hotmail.com");
    
    if (!user) {
      // Create the primary admin if it doesn't exist
      db.prepare("INSERT INTO users (name, email, plan, role) VALUES (?, ?, ?, ?)").run("Bruno G.", "bruno.gju@hotmail.com", "Elite", "admin");
      user = db.prepare("SELECT * FROM users WHERE email = ?").get("bruno.gju@hotmail.com");
    }
    
    res.json(user);
  });

  // Nutrition Routes
  app.get("/api/nutrition", (req, res) => {
    const user = db.prepare("SELECT id FROM users LIMIT 1").get();
    const logs = db.prepare("SELECT * FROM user_nutrition WHERE user_id = ? ORDER BY time DESC").all(user.id);
    res.json(logs);
  });

  app.post("/api/nutrition", (req, res) => {
    const user = db.prepare("SELECT id FROM users LIMIT 1").get();
    const { meal, time, description, calories, observation } = req.body;
    db.prepare("INSERT INTO user_nutrition (user_id, meal, time, description, calories, observation) VALUES (?, ?, ?, ?, ?, ?)")
      .run(user.id, meal, time, description, calories, observation);
    res.json({ success: true });
  });

  app.delete("/api/nutrition/:id", (req, res) => {
    db.prepare("DELETE FROM user_nutrition WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Promotions Routes
  app.get("/api/promotions", (req, res) => {
    const items = db.prepare("SELECT * FROM promotions WHERE active = 1").all();
    res.json(items);
  });

  app.get("/api/admin/promotions", (req, res) => {
    const items = db.prepare("SELECT * FROM promotions").all();
    res.json(items);
  });

  app.post("/api/admin/promotions", (req, res) => {
    const { title, description, price, original_price, category, link, image_url, active } = req.body;
    db.prepare(`
      INSERT INTO promotions (title, description, price, original_price, category, link, image_url, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, price, original_price, category, link, image_url, active ? 1 : 0);
    res.json({ success: true });
  });

  app.delete("/api/admin/promotions/:id", (req, res) => {
    db.prepare("DELETE FROM promotions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Media Routes
  app.get("/api/media", (req, res) => {
    const items = db.prepare("SELECT * FROM midias_motivacionais WHERE status = 'ativo'").all();
    res.json(items);
  });

  app.get("/api/admin/media", (req, res) => {
    const items = db.prepare("SELECT * FROM midias_motivacionais").all();
    res.json(items);
  });

  app.post("/api/media", (req, res) => {
    const { tipo, titulo, categoria, sinopse, plataforma, ano, imagem_url, link_externo, role } = req.body;
    const status = role === 'admin' ? 'ativo' : 'pendente';
    const aprovado = role === 'admin' ? 1 : 0;
    
    db.prepare(`
      INSERT INTO midias_motivacionais (tipo, titulo, categoria, sinopse, plataforma, ano, imagem_url, link_externo, criado_por, status, aprovado_por_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tipo, titulo, categoria, sinopse, plataforma, ano, imagem_url, link_externo, role || 'user', status, aprovado);
    
    res.json({ success: true, status });
  });

  app.post("/api/admin/media/approve/:id", (req, res) => {
    db.prepare("UPDATE midias_motivacionais SET status = 'ativo', aprovado_por_admin = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/media/:id", (req, res) => {
    db.prepare("DELETE FROM midias_motivacionais WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Helper to fetch metadata from URL
  app.post("/api/utils/fetch-metadata", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await nodeFetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      const metadata = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text(),
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')
      };

      res.json(metadata);
    } catch (error) {
      console.error("Metadata fetch error:", error);
      res.status(500).json({ error: "Failed to fetch metadata" });
    }
  });

  // Professionals Routes
  app.get("/api/professionals", (req, res) => {
    const items = db.prepare("SELECT * FROM recommended_professionals WHERE active = 1").all();
    res.json(items);
  });

  // Admin: Professionals Management
  app.get("/api/admin/professionals", (req, res) => {
    const items = db.prepare("SELECT * FROM recommended_professionals").all();
    res.json(items);
  });

  app.post("/api/admin/professionals", (req, res) => {
    const { name, specialty, bio, whatsapp, instagram, active, foto_url, foto_path } = req.body;
    db.prepare("INSERT INTO recommended_professionals (name, specialty, bio, whatsapp, instagram, active, foto_url, foto_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(name, specialty, bio, whatsapp, instagram, active ? 1 : 0, foto_url, foto_path);
    res.json({ success: true });
  });

  app.delete("/api/admin/professionals/:id", (req, res) => {
    db.prepare("DELETE FROM recommended_professionals WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Catalog Routes
  app.get("/api/catalog", (req, res) => {
    const items = db.prepare("SELECT * FROM catalog").all();
    res.json(items);
  });

  // Raffles Routes
  app.get("/api/raffles", (req, res) => {
    const items = db.prepare("SELECT * FROM raffles").all();
    res.json(items);
  });

  // Admin: User Management
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, plan, role } = req.body;
    try {
      db.prepare("INSERT INTO users (name, email, plan, role) VALUES (?, ?, ?, ?)")
        .run(name, email, plan || 'Starter', role || 'user');
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Email já cadastrado ou dados inválidos" });
    }
  });

  app.post("/api/admin/users/:id/plan", (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;
    db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, id);
    res.json({ success: true });
  });

  // Admin: Catalog Management
  app.post("/api/admin/catalog", (req, res) => {
    const { title, image_url, image_path, preview_blur_url, prompt, description, category, style, min_plan, status, created_by } = req.body;
    db.prepare(`
      INSERT INTO catalog (
        title, image_url, image_path, preview_blur_url, prompt, description, category, style, min_plan, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, image_url, image_path, preview_blur_url, prompt, description, category, style, min_plan, status, created_by);
    res.json({ success: true });
  });

  app.delete("/api/admin/catalog/:id", (req, res) => {
    db.prepare("DELETE FROM catalog WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Raffle Management
  app.post("/api/admin/raffles", (req, res) => {
    const { product, description, value_number, total_numbers, draw_date, status, image_url, image_path, thumbnail_url } = req.body;
    db.prepare(`
      INSERT INTO raffles (
        product, description, value_number, total_numbers, draw_date, status, image_url, image_path, thumbnail_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(product, description, value_number, total_numbers, draw_date, status, image_url, image_path, thumbnail_url);
    res.json({ success: true });
  });

  app.post("/api/admin/raffles/:id/sold", (req, res) => {
    const { id } = req.params;
    const { sold_numbers } = req.body;
    db.prepare("UPDATE raffles SET sold_numbers = ? WHERE id = ?").run(sold_numbers, id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
