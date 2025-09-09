import { ListItem, Typography, Box } from "@mui/material";

export default function MessageItem({ msg, currentUser }) {
  const isOwnMessage =
    msg.user === currentUser.username || msg.from === currentUser.username;

  // Detect if message is an image
  const isImage =
    typeof msg.text === "string" && msg.text.startsWith("/uploads/");

  // Fallback text handling
  const displayText =
    typeof msg.text === "string"
      ? msg.text
      : typeof msg.message === "string"
      ? msg.message
      : JSON.stringify(msg); // only stringify if something goes wrong

  // Format timestamp
  let timestamp = msg.ts;
  if (!timestamp) timestamp = Date.now();
  if (typeof timestamp === "string") timestamp = Number(timestamp);
  const date = new Date(timestamp);
  const formattedTime = isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          bgcolor: isOwnMessage ? "primary.main" : "grey.200",
          color: isOwnMessage ? "white" : "black",
          maxWidth: "70%",
          wordWrap: "break-word",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isImage ? (
          <img
            src={msg.text}
            alt="sent media"
            style={{
              maxWidth: "100%",
              borderRadius: 8,
            }}
          />
        ) : (
          <Typography>{displayText}</Typography>
        )}

        {/* Display formatted timestamp */}
        {formattedTime && (
          <Typography
            variant="caption"
            sx={{
              alignSelf: "flex-end",
              mt: 0.5,
              color: isOwnMessage ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
              fontSize: 11,
            }}
          >
            {formattedTime}
          </Typography>
        )}
      </Box>
    </ListItem>
  );
}
