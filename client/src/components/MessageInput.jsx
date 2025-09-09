import { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Popover } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Picker from '@emoji-mart/react';
import socket from "../socket";

export default function MessageInput({ user, onSend, onTyping, type = "room" }) {
  const [text, setText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const inputRef = useRef();


  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (onSend) {
      onSend(trimmed);
    } else if (type === "room") {
      socket.emit("chat message", trimmed);
      if (onTyping) onTyping(false);
      else socket.emit("typing", false);
    }

    setText("");
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);

    if (onTyping) onTyping(e.target.value.trim().length > 0);
    else if (type === "room") socket.emit("typing", true);

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        if (onTyping) onTyping(false);
        else if (type === "room") socket.emit("typing", false);
      }, 3000)
    );
  };

 
  const toggleEmojiPicker = (e) => {
    setEmojiAnchor(e.currentTarget);
  };

  const closeEmojiPicker = () => setEmojiAnchor(null);

  const addEmoji = (emoji) => {
    const cursorPos = inputRef.current.selectionStart;
    const newText =
      text.slice(0, cursorPos) + emoji.native + text.slice(cursorPos);
    setText(newText);

    // Keep cursor after emoji
    setTimeout(() => {
      inputRef.current.selectionStart = cursorPos + emoji.native.length;
      inputRef.current.selectionEnd = cursorPos + emoji.native.length;
      inputRef.current.focus();
    }, 0);
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Image upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.filePath) {
        if (onSend) onSend(data.filePath);
        else if (type === "room") socket.emit("chat message", data.filePath);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };


  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
   
      <IconButton onClick={toggleEmojiPicker}>
        <EmojiEmotionsIcon />
      </IconButton>

      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={closeEmojiPicker}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Picker onEmojiSelect={addEmoji} />
      </Popover>

     
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
      />

   
      <IconButton component="label">
        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        <InsertPhotoIcon />
      </IconButton>

     
      <IconButton color="primary" onClick={sendMessage}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
