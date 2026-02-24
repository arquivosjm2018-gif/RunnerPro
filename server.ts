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
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple User Mock for Demo (In a real app, this would be handled by Auth)
  app.get("/api/user/me", (req, res) => {
    let user = db.prepare("SELECT * FROM users LIMIT 1").get();
    if (!user) {
      db.prepare("INSERT INTO users (name, email, plan) VALUES (?, ?, ?)").run("Runner Guest", "guest@runnerpro.ai", "Elite");
      user = db.prepare("SELECT * FROM users LIMIT 1").get();
    }
    res.json(user);
  });

  // Catalog Routes
  app.get("/api/catalog", (req, res) => {
    const items = db.prepare("SELECT * FROM catalog").all();
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
