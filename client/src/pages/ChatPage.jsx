import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Paper, Box } from "@mui/material";
import socket from "../socket";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import PrivateChatModal from "../components/PrivateChatModal";

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("chat message", handleMessage);

    const handleHistory = (history) => {
      setMessages(history);
    };
    socket.on("history", handleHistory);

  
    const handleUsers = (users) => setOnlineUsers(users);
    socket.on("room users", handleUsers);

    
    const handleTyping = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        
        if (username === user.username) return prev;

        if (isTyping && !prev.includes(username)) {
          return [...prev, username];
        }
        if (!isTyping) {
          return prev.filter((u) => u !== username);
        }
        return prev;
      });
    };
    socket.on("typing", handleTyping);

  
    const handlePrivateMessage = (msg) => {
      console.log("PM received:", msg);
    };
    socket.on("private message", handlePrivateMessage);

    return () => {
      socket.off("chat message", handleMessage);
      socket.off("history", handleHistory);
      socket.off("room users", handleUsers);
      socket.off("typing", handleTyping);
      socket.off("private message", handlePrivateMessage);
    };
  }, [user, navigate]);

  const openPrivateChat = (username) => {
    if (username === user.username) return;
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
                style={{ cursor: "pointer", marginRight: 8, color: "blue" }}
                onClick={() => openPrivateChat(u)}
              >
                {u}
              </span>
            ))}
          </Typography>

          {typingUsers.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {typingUsers.join(", ")}{" "}
              {typingUsers.length > 1 ? "are" : "is"} typing...
            </Typography>
          )}
        </Box>

        <ChatWindow messages={messages} currentUser={user} />

        <MessageInput user={user} />

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
