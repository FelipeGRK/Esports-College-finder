import dotenv from 'dotenv';
dotenv.config({ path: "./src/connection.env" });
import express from 'express';
import cors from 'cors';
import path from 'path';
import mysql from 'mysql2';
import { fileURLToPath } from 'url';

// For ES modules, __dirname is not defined. So, we create it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "esports",
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// Route to get all colleges from the database
app.get("/api/colleges", (req, res) => {
  db.query("SELECT * FROM colleges", (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Database error" });
      return;
    }
    res.json(results);
  });
});

// NEW: Search endpoint for auto-complete suggestions
app.get("/api/colleges/search", (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.json([]);
  }
  db.query("SELECT * FROM colleges WHERE colleges LIKE ? LIMIT 10", [query + '%'], (err, results) => {
    if (err) {
      console.error("Error searching colleges:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Serve static files from the frontend folder (if desired)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
