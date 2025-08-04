import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import './index.css'; // Pastikan CSS diimpor

// Impor komponen yang sudah dipisah
import LoginPage from './components/LoginPage';
import ServiceTable from './components/ServiceTable'; 
// Impor ikon
import { Plus, LogOut } from 'lucide-react';

// Komponen Modal untuk Form
function ServiceFormModal({ isOpen, onClose, onSave, isLoading, initialData }) { // Hapus default value
  const [formData, setFormData] = useState({});

  // useEffect untuk mengisi data saat mode edit
  useEffect(() => {
    // --- INI BAGIAN YANG DIPERBAIKI ---
    // Tambahkan pengecekan `initialData` sebelum mengakses .id
    if (initialData && initialData.id) {
      setFormData(initialData);
    } else {
      // Set ke state kosong untuk mode "Tambah Baru"
      setFormData({ customer_name: '', customer_phone: '', item_name: '', item_damage: '' });
    }
  }, [initialData, isOpen]); // Tambahkan isOpen sebagai dependency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Servis' : 'Tambah Servis Baru'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input name="customer_name" value={formData.customer_name || ''} onChange={handleChange} placeholder="Nama Pelanggan" className="p-2 border rounded" required />
          <input name="customer_phone" value={formData.customer_phone || ''} onChange={handleChange} placeholder="No. Telepon" className="p-2 border rounded" />
          <input name="item_name" value={formData.item_name || ''} onChange={handleChange} placeholder="Nama Barang" className="p-2 border rounded md:col-span-2" required />
          <textarea name="item_damage" value={formData.item_damage || ''} onChange={handleChange} placeholder="Deskripsi Kerusakan" className="p-2 border rounded md:col-span-2" rows="3"></textarea>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}

// --- Komponen Utama Aplikasi ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk mengontrol modal form
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // Biarkan initial state null

  // State untuk Tab
  const [activeTab, setActiveTab] = useState('active'); // 'active' atau 'history'

  // Fungsi fetch, login, dan handler dasar
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching services:', error);
    else setServices(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchServices();
  }, [isAuthenticated, fetchServices]);
  
  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  const handleSave = async (formData) => {
    setIsLoading(true);
    let error;

    const dataToSave = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        item_name: formData.item_name,
        item_damage: formData.item_damage,
    };

    if (formData.id) { // Mode Edit
      const { error: updateError } = await supabase.from('services').update(dataToSave).eq('id', formData.id);
      error = updateError;
    } else { // Mode Tambah
      const { error: insertError } = await supabase.from('services').insert([{...dataToSave, status: 'Masuk'}]);
      error = insertError;
    }

    if (error) {
      alert('Gagal menyimpan data: ' + error.message);
    } else {
      setFormOpen(false); // Tutup modal setelah berhasil
      fetchServices();
    }
    setIsLoading(false);
  };

  const handleAddNew = () => {
    setEditingService(null); // Atur ke null untuk mode Tambah
    setFormOpen(true);       // Buka modal
  };

  const handleEdit = (service) => {
    setEditingService(service); // Isi data untuk diedit
    setFormOpen(true);          // Buka modal
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        setIsLoading(true);
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) alert('Gagal menghapus: ' + error.message);
        else fetchServices();
        setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id);
    if (error) alert('Gagal mengubah status: ' + error.message);
    else fetchServices();
  };
  
  // Logika untuk memisahkan data berdasarkan tab
  const activeServices = useMemo(() => services.filter(s => ['Masuk', 'Pengecekan', 'Dikerjakan'].includes(s.status)), [services]);
  const historyServices = useMemo(() => services.filter(s => ['Selesai', 'Diambil', 'Batal'].includes(s.status)), [services]);
  const servicesToShow = activeTab === 'active' ? activeServices : historyServices;

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Servis</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} /> Tambah Servis
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-200 rounded-full" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      
      {/* Tombol Tab */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Pekerjaan Aktif ({activeServices.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Riwayat Servis ({historyServices.length})
          </button>
        </nav>
      </div>

      {/* Modal Form akan dipanggil di sini */}
      <ServiceFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        isLoading={isLoading}
        initialData={editingService}
      />
      
      {/* Tabel akan menampilkan data sesuai tab yang aktif */}
      <ServiceTable
        services={servicesToShow}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default App;
