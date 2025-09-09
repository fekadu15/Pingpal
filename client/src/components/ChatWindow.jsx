import { Box, List } from "@mui/material";
import MessageItem from "./MessageItem";

export default function ChatWindow({ messages, currentUser }) {
  
  console.log(currentUser);
  
  return (
    <Box
      sx={{
        height: 400,
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: 2,
        mb: 2,
        p: 1,
      }}
    >
      <List>
        {messages.map((msg, idx) => (
          <MessageItem
            key={msg.ts || idx}
            msg={msg}
            currentUser={currentUser}
          />
        ))}
      </List>
    </Box>
  );
}
