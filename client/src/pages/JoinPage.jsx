import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Paper,
} from "@mui/material";
import socket from "../socket";

const rooms = ["General", "Tech", "Fun"];

export default function JoinPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(rooms[0]);
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username.trim()) return;
    setUser({ username, room });

    socket.connect();
    socket.emit("joinRoom", { username, room });

    navigate("/chat");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Join PingPal 🚀
        </Typography>

        <TextField
          label="Nickname"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Choose Room"
          fullWidth
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          sx={{ mb: 2 }}
        >
          {rooms.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          fullWidth
          onClick={handleJoin}
          disabled={!username}
        >
          Join Room
        </Button>
      </Paper>
    </Container>
  );
}
