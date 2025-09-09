import { useState, useEffect, useRef } from "react";
import { Modal, Box, Typography, IconButton, Paper, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import axios from "axios";
import socket from "../socket";

export default function PrivateChatModal({
  open,
  onClose,
  username,     
  currentUser,  
}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // Fetch private message history
  useEffect(() => {
    if (!open || !username || !currentUser) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/private-messages/${currentUser.username}/${username}`
        );
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch private messages:", err);
      }
    };

    fetchHistory();
  }, [open, username, currentUser]);

  // Listen for incoming private messages
  useEffect(() => {
    if (!currentUser) return;

    const handleIncoming = (msg) => {
      if (
        (msg.from === username && msg.to === currentUser.username) ||
        (msg.from === currentUser.username && msg.to === username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("private message", handleIncoming);
    return () => socket.off("private message", handleIncoming);
  }, [username, currentUser]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    const payload = {
      from: currentUser.username,
      to: username,
      text,
      ts: Date.now(),
      type: "private",
    };

    socket.emit("private message", payload);
    
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
          maxHeight: "80vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Paper
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Typography variant="subtitle1">{username}</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Paper>

        <Divider />

        {/* Chat Window */}
        <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
          <ChatWindow messages={messages} currentUser={currentUser} />
        </Box>

        <Divider />

        {/* Message Input */}
        <Box sx={{ p: 1 }}>
          <MessageInput user={currentUser} onSend={handleSend} type="private" />
        </Box>
      </Box>
    </Modal>
  );
}
