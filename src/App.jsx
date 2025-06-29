import './App.css';
import Pages from '@/pages/index.jsx';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login'; // הוספנו את דף ההתחברות
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // האם המשתמש מחובר

  return (
    <>
      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <Pages />
          <Toaster />
        </>
      )}
    </>
  );
}

export default App;
