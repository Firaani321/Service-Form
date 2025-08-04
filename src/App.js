import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function LoginPage({ onLoginSuccess }) {
  // Ambil sandi rahasia dari environment variables
  const SHARED_PASSWORD = process.env.REACT_APP_SHARED_PASSWORD;
  console.log('Password yang diterima dari environment:', SHARED_PASSWORD);


  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Beri peringatan jika sandi di environment variable belum di-set
    if (!SHARED_PASSWORD) {
      setError('Aplikasi belum dikonfigurasi dengan benar. Hubungi admin.');
      return;
    }
    
    if (password === SHARED_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Sandi yang Anda masukkan salah!');
    }
  };

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


// --- Komponen Utama Aplikasi ---

function App() {
  // State untuk status login
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State untuk data aplikasi
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ customer_name: '', customer_phone: '', item_name: '', item_damage: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Cek status login dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fungsi untuk mengambil data dari Supabase
  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching services:', error);
      alert('Gagal mengambil data servis: ' + error.message);
    } else {
      setServices(data);
    }
    setIsLoading(false);
  };

  // Ambil data servis ketika status login menjadi true
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated]);
  
  // Fungsi yang dipanggil saat login berhasil
  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };
  
  // Fungsi untuk logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    // Hapus data servis dari state agar tidak ditampilkan saat login kembali
    setServices([]);
  };

  // Fungsi untuk menghandle perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Fungsi untuk menyimpan data servis baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.item_name) {
      alert('Nama Pelanggan dan Nama Barang tidak boleh kosong!');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from('services').insert([{ 
      ...formData, 
      status: 'Masuk' 
    }]);

    if (error) {
      console.error('Error adding service:', error);
      alert('Gagal menambahkan servis: ' + error.message);
    } else {
      setFormData({ customer_name: '', customer_phone: '', item_name: '', item_damage: '' });
      fetchServices(); // Refresh tabel setelah berhasil
    }
    setIsLoading(false);
  };

  // Fungsi untuk mengubah status servis
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengubah status: ' + error.message);
    } else {
      setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  // Tampilkan halaman login jika belum terautentikasi
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Tampilkan halaman servis utama jika sudah terautentikasi
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Daftar Servis Toko</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      {/* FORM INPUT DATA */}
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <div className="form-group">
            <label>Nama Pelanggan</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} placeholder="Contoh: Budi Santoso" required />
          </div>
          <div className="form-group">
            <label>No. Telepon</label>
            <input type="text" name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} placeholder="Contoh: 081234567890" />
          </div>
          <div className="form-group">
            <label>Nama Barang</label>
            <input type="text" name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="Contoh: Laptop Asus ROG" required />
          </div>
          <div className="form-group">
            <label>Deskripsi Kerusakan</label>
            <input type="text" name="item_damage" value={formData.item_damage} onChange={handleInputChange} placeholder="Contoh: Mati total, tidak bisa charge" />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Servis'}
          </button>
        </div>
      </form>
      
      {/* TABEL DATA SERVIS */}
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pelanggan</th>
            <th>Barang</th>
            <th>Kerusakan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{new Date(service.created_at).toLocaleDateString('id-ID')}</td>
              <td>{service.customer_name}<br /><small>{service.customer_phone}</small></td>
              <td>{service.item_name}</td>
              <td>{service.item_damage}</td>
              <td>
                <select value={service.status} onChange={(e) => handleStatusChange(service.id, e.target.value)} className="status-select">
                  <option value="Masuk">Masuk</option>
                  <option value="Pengecekan">Pengecekan</option>
                  <option value="Dikerjakan">Dikerjakan</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Diambil">Diambil</option>
                  <option value="Batal">Batal</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
