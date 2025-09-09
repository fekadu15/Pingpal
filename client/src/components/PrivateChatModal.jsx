import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import socket from "../socket";

export default function PrivateChatModal({ open, onClose, username, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;

    const handlePrivate = (msg) => {
      if (
        (msg.from === currentUser.username && msg.to === username) ||
        (msg.from === username && msg.to === currentUser.username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("private message", handlePrivate);
    return () => socket.off("private message", handlePrivate);
  }, [open, username, currentUser.username]);

  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("private message", { toUsername: username, text });
    setText("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Chat with {username}
        </Typography>
        <List sx={{ maxHeight: 300, overflowY: "auto", mb: 1 }}>
          {messages.map((msg, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  msg.system
                    ? msg.text
                    : `${msg.from === currentUser.username ? "You" : msg.from}: ${msg.text}`
                }
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <IconButton color="primary" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Modal>
  );
}
