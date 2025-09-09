import { ListItem, Typography } from "@mui/material";

export default function MessageItem({ msg, currentUser }) {
  const isOwnMessage = msg.user === currentUser;

  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
      }}
    >
      <Typography
        sx={{
          p: 1,
          borderRadius: 1,
          bgcolor: isOwnMessage ? "primary.main" : "grey.200",
          color: isOwnMessage ? "white" : "black",
          maxWidth: "70%",
          wordWrap: "break-word",
        }}
      >
        {msg.text || msg.message || msg} 
      </Typography>
    </ListItem>
  );
}
