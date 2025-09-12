import { Box, List } from "@mui/material";
import MessageItem from "./MessageItem";

export default function ChatWindow({ messages, currentUser }) {
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
        {messages.map((msg, idx) => {
          
          let timestamp = msg.ts;
          if (!timestamp) timestamp = Date.now();
          if (typeof timestamp === "string") timestamp = Number(timestamp);

          const date = new Date(timestamp);
          const formattedTime = isNaN(date.getTime())
            ? ""
            : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return (
            <MessageItem
              key={msg.ts || idx}
              msg={{ ...msg, formattedTime }} // pass formatted time to MessageItem
              currentUser={currentUser}
            />
          );
        })}
      </List>
    </Box>
  );
}
