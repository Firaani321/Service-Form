import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// Impor komponen yang sudah dipisah
import LoginPage from './components/LoginPage';
import ServiceForm from './components/ServiceForm';
import ServiceTable from './components/ServiceTable';

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
  
  // --- Kumpulan Fungsi Handler ---
  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    setServices([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.item_name) {
      alert('Nama Pelanggan dan Nama Barang tidak boleh kosong!');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from('services').insert([{ ...formData, status: 'Masuk' }]);
    if (error) {
      alert('Gagal menambahkan servis: ' + error.message);
    } else {
      setFormData({ customer_name: '', customer_phone: '', item_name: '', item_damage: '' });
      fetchServices();
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert('Gagal mengubah status: ' + error.message);
    } else {
      setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  // --- Logika Tampilan ---
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Daftar Servis Toko</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <ServiceForm 
        formData={formData}
        onFormChange={handleInputChange}
        onFormSubmit={handleSubmit}
        isLoading={isLoading}
      />
      
      <ServiceTable 
        services={services}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default App;
