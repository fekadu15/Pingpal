import { useState, useEffect } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import socket from "../socket";

export default function MessageInput({ user }) {
  const [text, setText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

  
    socket.emit("chat message", trimmed);
    setText("");

    socket.emit("typing", false);


    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);

    socket.emit("typing", true);


    if (typingTimeout) clearTimeout(typingTimeout);

 
    setTypingTimeout(
      setTimeout(() => {
        socket.emit("typing", false);
      }, 5000)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <IconButton color="primary" onClick={sendMessage}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
