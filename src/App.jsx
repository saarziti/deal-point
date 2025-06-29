import React, { useEffect, useState } from "react";
import Pages from "./pages";
import LoginPage from "./pages/LoginPage"; // ודא שזה הנתיב הנכון

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (logged === "true") setIsLoggedIn(true);
  }, []);

  return isLoggedIn ? <Pages /> : <LoginPage onLogin={setIsLoggedIn} />;
}
