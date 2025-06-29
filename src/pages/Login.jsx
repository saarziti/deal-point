import React from 'react';

function Login({ onLogin }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>ברוך הבא</h1>
      <p>בחר כיצד להתחבר</p>

      <button onClick={onLogin}>התחבר כאורח</button>
    </div>
  );
}

export default Login;
