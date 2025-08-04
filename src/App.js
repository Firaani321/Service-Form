import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { Search, Filter, Plus, Edit, Trash2, Eye, DollarSign, XCircle, LogOut } from 'lucide-react';
import './index.css';

// --- Bagian Konfigurasi & Komponen ---

const SHARED_PASSWORD = process.env.REACT_APP_SHARED_PASSWORD;

// Komponen Modal Filter (baru)
function FilterModal({ isOpen, onClose, onApply, initialFilters }) {
    const [statuses, setStatuses] = useState(initialFilters.statuses || []);
    const [startDate, setStartDate] = useState(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters.endDate || '');

    const handleStatusToggle = (status) => {
        setStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    const handleApply = () => {
        onApply({ statuses, startDate, endDate });
        onClose();
    };
    
    if (!isOpen) return null;

    const statusOptions = ['Masuk', 'Pengecekan', 'Dikerjakan', 'Selesai', 'Diambil', 'Batal'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold p-4 border-b">Filter Servis</h3>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="font-semibold block mb-2">Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map(s => (
                                <label key={s} className="flex items-center gap-2">
                                    <input type="checkbox" checked={statuses.includes(s)} onChange={() => handleStatusToggle(s)} />
                                    {s}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold block mb-2">Rentang Tanggal</label>
                        <div className="flex gap-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                    <button onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded">Terapkan</button>
                </div>
            </div>
        </div>
    );
}

// Komponen Halaman Login (tidak berubah signifikan)
function LoginPage({ onLoginSuccess }) {
    // ... (kode LoginPage tetap sama seperti sebelumnya)
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!SHARED_PASSWORD) {
        setError('Aplikasi belum dikonfigurasi. Hubungi admin.');
        return;
      }
      if (password === SHARED_PASSWORD) {
        onLoginSuccess();
      } else {
        setError('Sandi yang Anda masukkan salah!');
      }
    };
  
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <form onSubmit={handleSubmit} style={{ padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '10px' }}>Akses Terbatas</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>Masukkan sandi untuk melanjutkan.</p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}
                    autoFocus
                />
                <button type="submit" style={{ width: '100%', padding: '10px', border: 'none', background: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                    Masuk
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
}


// --- Komponen Utama Aplikasi ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ id: null, customer_name: '', customer_phone: '', item_name: '', item_damage: '', status: 'Masuk' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ statuses: [], startDate: '', endDate: '' });

  // Cek login dari localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) setIsAuthenticated(true);
  }, []);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching services:', error);
    else setServices(data);
    setIsLoading(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { id, ...dataToSave } = formData;
    let error;

    if (id) { // Mode Edit
      const { error: updateError } = await supabase.from('services').update(dataToSave).eq('id', id);
      error = updateError;
    } else { // Mode Tambah
      const { error: insertError } = await supabase.from('services').insert([dataToSave]);
      error = insertError;
    }

    if (error) {
      alert('Gagal menyimpan data: ' + error.message);
    } else {
      setFormOpen(false);
      fetchServices();
    }
    setIsLoading(false);
  };

  const handleEdit = (service) => {
    setFormData({
        id: service.id,
        customer_name: service.customer_name,
        customer_phone: service.customer_phone,
        item_name: service.item_name,
        item_damage: service.item_damage,
        status: service.status
    });
    setFormOpen(true);
  };
  
  const handleAddNew = () => {
    setFormData({ id: null, customer_name: '', customer_phone: '', item_name: '', item_damage: '', status: 'Masuk' });
    setFormOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data servis ini?')) {
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

  const filteredServices = useMemo(() => {
    return services.filter(service => {
        const matchesSearch = 
            service.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.id.toString().includes(searchQuery);

        const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(service.status);
        
        const serviceDate = new Date(service.created_at);
        const matchesStartDate = !filters.startDate || serviceDate >= new Date(filters.startDate);
        const matchesEndDate = !filters.endDate || serviceDate <= new Date(filters.endDate + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [services, searchQuery, filters]);

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

      <div className="mb-6 flex gap-4">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Cari berdasarkan pelanggan, barang, atau ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 pl-10 border rounded-lg"/>
        </div>
        <button onClick={() => setFilterOpen(true)} className="relative p-3 bg-white border rounded-lg hover:bg-gray-100">
            <Filter size={20} />
            { (filters.statuses.length > 0 || filters.startDate || filters.endDate) && 
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {filters.statuses.length + (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0)}
                </span>
            }
        </button>
      </div>

      {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                  <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Servis' : 'Tambah Servis Baru'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input name="customer_name" value={formData.customer_name} onChange={handleInputChange} placeholder="Nama Pelanggan" className="p-2 border rounded" required />
                      <input name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} placeholder="No. Telepon" className="p-2 border rounded" />
                      <input name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="Nama Barang" className="p-2 border rounded md:col-span-2" required />
                      <textarea name="item_damage" value={formData.item_damage} onChange={handleInputChange} placeholder="Deskripsi Kerusakan" className="p-2 border rounded md:col-span-2" rows="3"></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                      <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
                  </div>
              </form>
          </div>
      )}

      <FilterModal isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} onApply={setFilters} initialFilters={filters} />
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Tanggal</th>
                <th className="p-3 text-left">Pelanggan</th>
                <th className="p-3 text-left">Barang</th>
                <th className="p-3 text-left">Kerusakan</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{service.id}</td>
                  <td className="p-3">{new Date(service.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{service.customer_name}<br/><small className="text-gray-500">{service.customer_phone}</small></td>
                  <td className="p-3">{service.item_name}</td>
                  <td className="p-3">{service.item_damage}</td>
                  <td className="p-3">
                    <select value={service.status} onChange={(e) => handleStatusChange(service.id, e.target.value)} className="p-1 border rounded bg-white">
                        <option value="Masuk">Masuk</option>
                        <option value="Pengecekan">Pengecekan</option>
                        <option value="Dikerjakan">Dikerjakan</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Diambil">Diambil</option>
                        <option value="Batal">Batal</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(service)} className="p-2 hover:bg-gray-200 rounded-full" title="Edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-gray-200 rounded-full" title="Hapus"><Trash2 size={16}/></button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}

export default App;
