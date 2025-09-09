import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Paper, Box } from "@mui/material";
import socket from "../socket";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import PrivateChatModal from "../components/PrivateChatModal";

export default function ChatPage({ user }) {
  const [messages, setMessages] = useState([]); // room messages only
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);
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
          You’re in Room: <strong>{user.room}</strong> as <strong>{user.username}</strong>
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
              {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
            </Typography>
          )}
        </Box>

        {/* Room chat */}
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
