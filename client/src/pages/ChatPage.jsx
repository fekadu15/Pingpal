// ChatPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Paper, Box, Badge } from "@mui/material";
import socket from "../socket";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import PrivateChatModal from "../components/PrivateChatModal";

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]); // room messages only
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);


  const [unreadPMs, setUnreadPMs] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Room messages
    const handleRoomMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, type: "room" }]);
    };
    socket.on("chat message", handleRoomMessage);

    // Room message history
    const handleHistory = (history) => {
      const roomMessages = history.map((m) => ({ ...m, type: "room" }));
      setMessages(roomMessages);
    };
    socket.on("history", handleHistory);

    // Online users
    const handleUsers = (users) => setOnlineUsers(users);
    socket.on("room users", handleUsers);

    // Typing indicator
    const handleTyping = ({ username: u, isTyping }) => {
      setTypingUsers((prev) => {
        if (u === user.username) return prev;
        if (isTyping && !prev.includes(u)) return [...prev, u];
        if (!isTyping) return prev.filter((name) => name !== u);
        return prev;
      });
    };
    socket.on("typing", handleTyping);

    return () => {
      socket.off("chat message", handleRoomMessage);
      socket.off("history", handleHistory);
      socket.off("room users", handleUsers);
      socket.off("typing", handleTyping);
    };
  }, [user, navigate]);

  // Listen for private messages globally and increment unread counts.
  // If the modal for the sender is currently open, don't increment.
  useEffect(() => {
    if (!user) return;

    const handlePrivateForBadge = (msg) => {
      // msg: { from, to, text, ts } (as emitted by server)
      if (msg.to !== user.username) return; // not for me
      if (msg.from === user.username) return; // I sent it, ignore
      if (privateChatUser === msg.from) return; // chat with sender is open -> don't count

      setUnreadPMs((prev) => ({
        ...prev,
        [msg.from]: (prev[msg.from] || 0) + 1,
      }));
    };

    socket.on("private message", handlePrivateForBadge);
    return () => socket.off("private message", handlePrivateForBadge);
  }, [user, privateChatUser]);

  // Open private chat and clear unread count for that user
  const openPrivateChat = (username) => {
    if (username === user.username) return;

 
    setUnreadPMs((prev) => {
      if (!prev || !prev[username]) return prev;
      const copy = { ...prev };
      delete copy[username];
      return copy;
    });

    setPrivateChatUser(username);
  };

  const closePrivateChat = () => setPrivateChatUser(null);

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          You’re in Room: <strong>{user.room}</strong> as{" "}
          <strong>{user.username}</strong>
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2">
            Online:{" "}
            {onlineUsers.map((u) => (
              <span
                key={u}
                style={{ cursor: "pointer", marginRight: 8, display: "inline-flex", alignItems: "center" }}
                onClick={() => openPrivateChat(u)}
              >
                <Badge
                  color="error"
                  badgeContent={unreadPMs[u] || 0}
                  invisible={!unreadPMs[u]}
                >
                  <span style={{ color: "blue" }}>{u}</span>
                </Badge>
              </span>
            ))}
          </Typography>

          {typingUsers.length > 0 && (
  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
      {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing
    </Typography>
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "text.secondary",
            animation: "bounce 1.4s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </Box>
    <style>
      {`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}
    </style>
  </Box>
)}

        </Box>

       
        <ChatWindow messages={messages} currentUser={user} />
        <MessageInput
          user={user}
          onSend={(msg) => socket.emit("chat message", msg)}
          type="room"
        />

        {privateChatUser && (
          <PrivateChatModal
            open={!!privateChatUser}
            onClose={closePrivateChat}
            username={privateChatUser}
            currentUser={user}
          />
        )}
      </Paper>
    </Container>
  );
}
