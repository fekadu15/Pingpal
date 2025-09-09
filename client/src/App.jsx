import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import JoinPage from "./pages/JoinPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<JoinPage setUser={setUser} />} />
      <Route path="/chat" element={<ChatPage user={user} />} />
    </Routes>
  );
}

export default App;
