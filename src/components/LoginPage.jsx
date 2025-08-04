import React, { useState } from 'react';

// Sandi sekarang diambil dari environment variable, ini aman.
const SHARED_PASSWORD = process.env.REACT_APP_SHARED_PASSWORD;

function LoginPage({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!SHARED_PASSWORD) {
      setError('Aplikasi belum dikonfigurasi. Hubungi admin.');
      return;
    }
    if (password === SHARED_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Sandi yang Anda masukkan salah!');
    }
  };

  // ... (Kode JSX dan styling untuk halaman login bisa ditaruh di sini)
  // ... (Sama seperti kode LoginPage di dalam App.js sebelumnya)
  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f9' },
    loginBox: { padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center', width: '350px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    input: { padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px', fontSize: '16px', color: 'white', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Akses Terbatas</h2>
        <p>Silakan masukkan sandi untuk melanjutkan.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan sandi..." style={styles.input} autoFocus/>
          <button type="submit" style={styles.button}>Masuk</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
