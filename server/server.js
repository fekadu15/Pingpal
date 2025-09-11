// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Setup uploads directory ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve static files
app.use("/uploads", express.static(uploadDir));

// --- Database ---
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// --- Server + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

const roomUsers = {};

// --- Socket.IO events ---
io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // Join room
  socket.on("joinRoom", async ({ username, room }) => {
    if (!username || !room) return;

    if (socket.data.room) {
      socket.leave(socket.data.room);
      roomUsers[socket.data.room] =
        roomUsers[socket.data.room]?.filter((u) => u !== socket.data.username) || [];
      io.to(socket.data.room).emit("room users", roomUsers[socket.data.room]);
    }

    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);

    if (!roomUsers[room]) roomUsers[room] = [];
    roomUsers[room].push(username);

    io.to(room).emit("chat message", {
      user: "System",
      text: `${username} joined ${room}`,
      ts: Date.now(),
      system: true,
    });

    io.to(room).emit("room users", roomUsers[room]);

    try {
      const res = await pool.query(
        `SELECT username, message, timestamp AS ts FROM messages
         WHERE room = $1 ORDER BY timestamp DESC LIMIT 20`,
        [room]
      );
      const history = res.rows.reverse();
      socket.emit("history", history);
    } catch (err) {
      console.error("DB fetch error:", err);
    }

    socket.emit("joinedRoom", { room });
  });

  // Room chat message
  socket.on("chat message", async (text) => {
    const { username, room } = socket.data || {};
    if (!username || !room) return;

    const payload = { user: username, text, ts: Date.now() };

    try {
      await pool.query(
        `INSERT INTO messages (username, room, message, timestamp)
         VALUES ($1, $2, $3, $4)`,
        [username, room, text, payload.ts]
      );
    } catch (err) {
      console.error("DB insert error:", err);
    }

    io.to(room).emit("chat message", payload);
    console.log(`[${room}] ${username}: ${text}`);
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    const { username, room } = socket.data || {};
    if (username && room) {
      socket.to(room).emit("typing", { username, isTyping });
    }
  });

 
  socket.on("private message", async ({ to, text }) => {
    const from = socket.data.username;
    if (!from || !to || !text) return;

    const payload = { from, to, text, ts: Date.now() };
    console.log(payload);
    try {
      await pool.query(
        `INSERT INTO private_messages (sender, receiver, text, ts)
         VALUES ($1, $2, $3, $4)`,
        [from, to, text, payload.ts]
      );
    } catch (err) {
      console.error("Private message insert error:", err);
    }


    for (let [id, s] of io.of("/").sockets) {
      if (s.data.username === to) {
        s.emit("private message", payload);
      }
    }

    
    socket.emit("private message", payload);
  });

  socket.on("disconnect", () => {
    const { username, room } = socket.data || {};
    if (username && room) {
      roomUsers[room] = roomUsers[room]?.filter((u) => u !== username) || [];
      io.to(room).emit("room users", roomUsers[room]);

      io.to(room).emit("chat message", {
        user: "System",
        text: `${username} left ${room}`,
        ts: Date.now(),
        system: true,
      });
    }
    console.log("❌ Disconnected:", socket.id);
  });
});


app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});


app.get("/private-messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const result = await pool.query(
      `SELECT sender AS "from", receiver AS "to", text, ts
       FROM private_messages
       WHERE (sender=$1 AND receiver=$2) OR (sender=$2 AND receiver=$1)
       ORDER BY ts ASC`,
      [user1, user2]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch private messages error:", err);
    res.status(500).json({ error: "Failed to fetch private messages" });
  }
});

app.get("/", (_req, res) => res.send("PingPal server running"));

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
