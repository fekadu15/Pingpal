// import { Outlet } from "react-router-dom";
// import { useState, useMemo } from "react";
// import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
// import Header from "./Header";

// export default function Layout() {
//   const [darkMode, setDarkMode] = useState(false);

//   const theme = useMemo(
//     () =>
//       createTheme({
//         palette: {
//           mode: darkMode ? "dark" : "light",
//         },
//       }),
//     [darkMode]
//   );

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
      
//       <Header darkMode={darkMode} setDarkMode={setDarkMode} currentPage="" />

//       <Outlet />
//     </ThemeProvider>
//   );
// }
