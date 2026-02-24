import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("runnerpro.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    plan TEXT DEFAULT 'Starter',
    status_pagamento TEXT DEFAULT 'Pendente'
  );

  CREATE TABLE IF NOT EXISTS raffles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product TEXT,
    value_number REAL,
    total_numbers INTEGER,
    sold_numbers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Ativo'
  );

  CREATE TABLE IF NOT EXISTS catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    prompt TEXT,
    category TEXT,
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

  CREATE TABLE IF NOT EXISTS recommended_professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    specialty TEXT,
    bio TEXT,
    whatsapp TEXT,
    instagram TEXT,
    active INTEGER DEFAULT 1
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple User Mock for Demo
  app.get("/api/user/me", (req, res) => {
    let user = db.prepare("SELECT * FROM users LIMIT 1").get();
    if (!user) {
      db.prepare("INSERT INTO users (name, email, plan) VALUES (?, ?, ?)").run("Runner Guest", "guest@runnerpro.ai", "Elite");
      user = db.prepare("SELECT * FROM users LIMIT 1").get();
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
    const { name, specialty, bio, whatsapp, instagram, active } = req.body;
    db.prepare("INSERT INTO recommended_professionals (name, specialty, bio, whatsapp, instagram, active) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, specialty, bio, whatsapp, instagram, active ? 1 : 0);
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

  app.post("/api/admin/users/:id/plan", (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;
    db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, id);
    res.json({ success: true });
  });

  // Admin: Catalog Management
  app.post("/api/admin/catalog", (req, res) => {
    const { image_url, prompt, category, created_by } = req.body;
    db.prepare("INSERT INTO catalog (image_url, prompt, category, created_by) VALUES (?, ?, ?, ?)")
      .run(image_url, prompt, category, created_by);
    res.json({ success: true });
  });

  app.delete("/api/admin/catalog/:id", (req, res) => {
    db.prepare("DELETE FROM catalog WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Raffle Management
  app.post("/api/admin/raffles", (req, res) => {
    const { product, value_number, total_numbers } = req.body;
    db.prepare("INSERT INTO raffles (product, value_number, total_numbers) VALUES (?, ?, ?)")
      .run(product, value_number, total_numbers);
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
