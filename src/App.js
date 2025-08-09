import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import './index.css'; // Pastikan CSS diimpor

// --- Impor untuk Navigasi Halaman ---
import { Routes, Route, Link } from 'react-router-dom';

// --- Impor Komponen Halaman ---
import LoginPage from './components/LoginPage';
import ServiceTable from './components/ServiceTable';
import WhatsAppPage from './components/WhatsAppPage'; // Halaman baru untuk WhatsApp

// --- Impor Ikon ---
import { Plus, LogOut, MessageSquare, Search, Filter } from 'lucide-react'; // Tambahkan ikon Search & Filter

// Komponen Modal untuk Form (Tidak ada perubahan)
function ServiceFormModal({ isOpen, onClose, onSave, isLoading, initialData }) {
  const [formData, setFormData] = useState({ high_priority: false });

  useEffect(() => {
    if (initialData && initialData.id) {
      setFormData(initialData);
    } else {
      setFormData({ customer_name: '', customer_phone: '', item_name: '', item_damage: '', high_priority: false });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

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
          
          {/* --- CHECKBOX BARU UNTUK HIGH PRIORITY --- */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="high_priority" name="high_priority" checked={!!formData.high_priority} onChange={handleChange} className="h-4 w-4" />
            <label htmlFor="high_priority" className="font-medium text-red-600">Jadikan Prioritas Tinggi (High Priority)</label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}

// --- Komponen Halaman Servis (Sebelumnya adalah App) ---
function ServicePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' sebagai default
  
  const fetchServices = useCallback(async () => { setIsLoading(true); const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false }); if (error) console.error('Error fetching services:', error); else setServices(data); setIsLoading(false); }, []);
  useEffect(() => { const loggedIn = localStorage.getItem('isLoggedIn') === 'true'; if (loggedIn) setIsAuthenticated(true); }, []);
  useEffect(() => { if (isAuthenticated) fetchServices(); }, [isAuthenticated, fetchServices]);
  const handleLoginSuccess = () => { localStorage.setItem('isLoggedIn', 'true'); setIsAuthenticated(true); };
  const handleLogout = () => { localStorage.removeItem('isLoggedIn'); setIsAuthenticated(false); };

  // --- FUNGSI HANDLE SAVE DIPERBARUI ---
  const handleSave = async (formData) => {
    setIsLoading(true);
    let error;
    
    // Pastikan semua data yang relevan disertakan
    const dataToSave = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      item_name: formData.item_name,
      item_damage: formData.item_damage,
      high_priority: formData.high_priority || false, // Sertakan status prioritas
    };

    if (formData.id) {
      const { error: updateError } = await supabase.from('services').update(dataToSave).eq('id', formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('services').insert([{...dataToSave, status: 'Masuk'}]);
      error = insertError;
    }

    if (error) { alert('Gagal menyimpan data: ' + error.message); } 
    else { setFormOpen(false); fetchServices(); }
    setIsLoading(false);
  };

  const handleAddNew = () => { setEditingService(null); setFormOpen(true); };
  const handleEdit = (service) => { setEditingService(service); setFormOpen(true); };
  const handleDelete = async (id) => { if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) { setIsLoading(true); const { error } = await supabase.from('services').delete().eq('id', id); if (error) alert('Gagal menghapus: ' + error.message); else fetchServices(); setIsLoading(false); } };
  const handleStatusChange = async (id, newStatus) => { const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', id); if (error) alert('Gagal mengubah status: ' + error.message); else fetchServices(); };
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === '' ||
        service.id.toString().includes(lowerCaseQuery) ||
        service.customer_name?.toLowerCase().includes(lowerCaseQuery) ||
        service.item_name?.toLowerCase().includes(lowerCaseQuery) ||
        service.item_damage?.toLowerCase().includes(lowerCaseQuery);
      return matchesStatus && matchesSearch;
    });
  }, [services, searchQuery, statusFilter]);
  const activeServices = useMemo(() => filteredServices.filter(s => ['Masuk', 'Pengecekan', 'Dikerjakan'].includes(s.status)), [filteredServices]);
  const historyServices = useMemo(() => filteredServices.filter(s => ['Selesai', 'Diambil', 'Batal'].includes(s.status)), [filteredServices]);
  
  // Logika `servicesToShow` tetap sama, tapi sekarang sumber datanya sudah benar
  const servicesToShow = activeTab === 'active' ? activeServices : historyServices;

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    // --- PENYESUAIAN RESPONSIF DITERAPKAN DI SINI ---
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header: Di HP (flex-col), di tablet ke atas (md:flex-row) */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Servis</h1>
        
        {/* Tombol-tombol di header dibuat lebih kecil di HP */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/whatsapp" className="flex items-center gap-2 px-3 py-2 md:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs md:text-sm">
            <MessageSquare size={16} />
            {/* Teks hanya muncul di layar sm ke atas */}
            <span className="hidden sm:inline">Hubungkan WA</span>
          </Link>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs md:text-sm">
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Servis</span>
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-200 rounded-full" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Search & Filter: Di HP (flex-col), di tablet ke atas (sm:flex-row) */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari ID, nama, barang..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto p-3 pl-10 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="Masuk">Masuk</option>
            <option value="Pengecekan">Pengecekan</option>
            <option value="Dikerjakan">Dikerjakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Diambil">Diambil</option>
            <option value="Batal">Batal</option>
          </select>
        </div>
      </div>
      
      {/* Tombol Tab: Ukuran padding dan teks disesuaikan untuk HP */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-2" aria-label="Tabs">
          <button onClick={() => setActiveTab('active')} className={`py-3 px-4 md:px-6 rounded-t-lg font-medium text-xs md:text-sm transition-colors ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Pekerjaan Aktif ({activeServices.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={`py-3 px-4 md:px-6 rounded-t-lg font-medium text-xs md:text-sm transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
            Riwayat Servis ({historyServices.length})
          </button>
        </nav>
      </div>

      <ServiceFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSave={handleSave} isLoading={isLoading} initialData={editingService} />
      
      <ServiceTable services={servicesToShow} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
    </div>
  );
}

// --- Komponen App Baru (Sebagai Router Utama) ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<ServicePage />} />
      <Route path="/whatsapp" element={<WhatsAppPage />} />
    </Routes>
  );
}

export default App;
