// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
const { log } = require("console");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// --- PostgreSQL Pool ---
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});


const roomUsers = {}; 

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);


  const handleJoin = async ({ username, room }) => {
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
         WHERE room = $1
         ORDER BY timestamp DESC
         LIMIT 20`,
        [room]
      );
     
      const history = res.rows.reverse(); 
      socket.emit("history", history);
    } catch (err) {
      console.error("DB fetch error:", err);
    }

    socket.emit("joinedRoom", { room });
  };
  socket.on("joinRoom", handleJoin);

  
  const handleChat = async (text) => {
    const { username, room } = socket.data || {};
    if (!room || !username) {
      socket.emit("chat message", {
        user: "System",
        text: "Join a room first.",
        ts: Date.now(),
        system: true,
      });
      return;
    }

 const payload = { user: username, text, ts: Date.now() };

try {
  await pool.query(
    `INSERT INTO messages (username, room, message, timestamp)
     VALUES ($1, $2, $3, $4)`,
    [username, room, text, payload.ts] // store raw ms since epoch
  );
} catch (err) {
  console.error("DB insert error:", err);
}


    io.to(room).emit("chat message", payload);
    console.log(`[${room}] ${username}: ${text}`);
  };
  socket.on("chat message", handleChat);
-
  socket.on("typing", (isTyping) => {
    const { username, room } = socket.data || {};
    if (room && username) {
      socket.to(room).emit("typing", { username, isTyping });
    }
  });

  socket.on("private message", ({ to, text }) => {
    const from = socket.data.username;
    if (!from || !to || !text) return;

    const payload = { from, to, text, ts: Date.now() };

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

app.get("/", (_req, res) => res.send("PingPal server running"));

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
