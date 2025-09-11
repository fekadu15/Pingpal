// import { useState } from "react";
// import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from "@mui/material";
// import { Brightness4, Brightness7, AccountCircle } from "@mui/icons-material";

// export default function Header({ darkMode, setDarkMode, currentPage }) {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = () => {
//     handleMenuClose();
//     // You can also add a redirect or state clear here if needed
//     window.location.href = "/";
//   };

//   return (
//     <AppBar position="sticky" color="primary">
//       <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//         {/* Left: App name */}
//         <Typography variant="h6">PingPal</Typography>


//         {/* Right: controls */}
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           {/* Dark mode toggle */}
//           <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
//             {darkMode ? <Brightness7 /> : <Brightness4 />}
//           </IconButton>

//           {/* Profile menu */}
//           <IconButton color="inherit" onClick={handleMenuOpen}>
//             <AccountCircle />
//           </IconButton>
//           <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
//             <MenuItem onClick={handleLogout}>Logout</MenuItem>
//             <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
//             <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
//           </Menu>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }
