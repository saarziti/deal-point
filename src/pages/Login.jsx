import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleLogin = () => {
    // כאן אפשר להוסיף אימות בסיסמה/קוד זמני/מייל וכו'
    if (email && code === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      onLogin(true);
    } else {
      alert("פרטי התחברות לא נכונים");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>התחברות לאתר</h2>
      <input
        type="email"
        placeholder="הכנס מייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="קוד חד פעמי"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleLogin}>התחבר</button>
    </div>
  );
}
