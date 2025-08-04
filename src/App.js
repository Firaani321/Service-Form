import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  // State untuk menyimpan daftar servis dari database
  const [services, setServices] = useState([]);
  // State untuk data yang sedang diisi di form
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    item_name: '',
    item_damage: '',
  });
  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);

  // --- FUNGSI UNTUK MENGAMBIL DATA DARI SUPABASE ---
  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false }); // Tampilkan yang terbaru di atas

    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data);
    }
    setIsLoading(false);
  };

  // Jalankan fetchServices() saat komponen pertama kali dimuat
  useEffect(() => {
    fetchServices();
  }, []);

  // --- FUNGSI UNTUK MENGHANDLE PERUBAHAN INPUT FORM ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // --- FUNGSI UNTUK MENYIMPAN DATA BARU ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.item_name) {
      alert('Nama Pelanggan dan Nama Barang tidak boleh kosong!');
      return;
    }

    setIsLoading(true);
    // Masukkan data baru ke tabel 'services'
    const { error } = await supabase.from('services').insert([
      {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        item_name: formData.item_name,
        item_damage: formData.item_damage,
        status: 'Masuk', // Status default saat data baru masuk
      },
    ]);

    if (error) {
      console.error('Error adding service:', error);
      alert('Gagal menambahkan servis: ' + error.message);
    } else {
      // Jika berhasil, reset form dan ambil ulang data terbaru
      setFormData({
        customer_name: '',
        customer_phone: '',
        item_name: '',
        item_damage: '',
      });
      fetchServices(); // Refresh tabel
    }
    setIsLoading(false);
  };
  
  // --- FUNGSI UNTUK MENGUBAH STATUS SERVIS ---
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('services')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      // Update state secara lokal agar UI langsung berubah tanpa perlu fetch ulang
      setServices(services.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
  };

  return (
    <div className="container">
      <h1>Input Servis Masuk</h1>
      
      {/* --- FORM INPUT DATA --- */}
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <div className="form-group">
            <label>Nama Pelanggan</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>
          <div className="form-group">
            <label>No. Telepon</label>
            <input
              type="text"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="Contoh: 081234567890"
            />
          </div>
          <div className="form-group">
            <label>Nama Barang</label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleInputChange}
              placeholder="Contoh: Laptop Asus ROG"
              required
            />
          </div>
          <div className="form-group">
            <label>Deskripsi Kerusakan</label>
            <input
              type="text"
              name="item_damage"
              value={formData.item_damage}
              onChange={handleInputChange}
              placeholder="Contoh: Mati total, tidak bisa charge"
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Servis'}
          </button>
        </div>
      </form>
      
      {/* --- TABEL DATA SERVIS --- */}
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
              <td>
                {service.customer_name}
                <br />
                <small>{service.customer_phone}</small>
              </td>
              <td>{service.item_name}</td>
              <td>{service.item_damage}</td>
              <td>
                <select 
                  value={service.status}
                  onChange={(e) => handleStatusChange(service.id, e.target.value)}
                >
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