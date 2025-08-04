import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

// Fungsi untuk menentukan warna highlight berdasarkan status
const getStatusHighlightStyle = (status) => {
  const styles = {
    'Masuk': 'bg-blue-50 hover:bg-blue-100',
    'Pengecekan': 'bg-yellow-50 hover:bg-yellow-100',
    'Dikerjakan': 'bg-orange-50 hover:bg-orange-100',
    'Selesai': 'bg-green-50 hover:bg-green-100',
    'Diambil': 'bg-teal-50 hover:bg-teal-100',
    'Batal': 'bg-red-50 hover:bg-red-100',
  };
  return styles[status] || 'bg-white hover:bg-gray-50';
};

// Urutan progres status untuk validasi
const statusOrder = {
  'Masuk': 1,
  'Pengecekan': 2,
  'Dikerjakan': 3,
  'Selesai': 4,
  'Diambil': 5,
  'Batal': 5, // Status final
};

function ServiceTable({ services, onEdit, onDelete, onStatusChange }) {
  if (!services || services.length === 0) {
    return <div className="text-center py-10 text-gray-500">Tidak ada data untuk ditampilkan.</div>;
  }

  // --- LOGIKA BARU UNTUK MENGUBAH STATUS ---
  const handleStatusChange = (service, newStatus) => {
    const currentStatusOrder = statusOrder[service.status];
    const newStatusOrder = statusOrder[newStatus];

    // Jika status sama, tidak melakukan apa-apa
    if (service.status === newStatus) {
      return;
    }

    // Jika mencoba mengubah ke status sebelumnya (mundur)
    if (newStatusOrder < currentStatusOrder) {
      alert(`Tidak bisa mengubah status dari "${service.status}" ke "${newStatus}". Progres tidak bisa mundur.`);
      // Reset dropdown kembali ke nilai semula secara visual (opsional, karena state tidak berubah)
      const selectElement = document.querySelector(`select[data-id='${service.id}']`);
      if (selectElement) selectElement.value = service.status;
      return;
    }

    // Tampilkan alert konfirmasi sebelum mengubah
    if (window.confirm(`Anda yakin ingin mengubah status dari "${service.status}" menjadi "${newStatus}"?`)) {
      onStatusChange(service.id, newStatus);
    } else {
      // Jika pengguna membatalkan, kembalikan dropdown ke nilai semula
      const selectElement = document.querySelector(`select[data-id='${service.id}']`);
      if (selectElement) selectElement.value = service.status;
    }
  };

  return (
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
          {services.map(service => (
            // --- PENAMBAHAN WARNA HIGHLIGHT DI SINI ---
            <tr key={service.id} className={`border-b ${getStatusHighlightStyle(service.status)}`}>
              <td className="p-3 font-mono text-xs">{service.id}</td>
              <td className="p-3">{new Date(service.created_at).toLocaleDateString('id-ID')}</td>
              <td className="p-3">{service.customer_name}<br/><small className="text-gray-500">{service.customer_phone}</small></td>
              <td className="p-3">{service.item_name}</td>
              <td className="p-3">{service.item_damage}</td>
              <td className="p-3">
                <select 
                  value={service.status}
                  // Gunakan handler baru
                  onChange={(e) => handleStatusChange(service, e.target.value)} 
                  data-id={service.id} // Tambahkan data-id untuk referensi
                  className="p-1 border rounded bg-white"
                >
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
                      <button onClick={() => onEdit(service)} className="p-2 hover:bg-gray-200 rounded-full" title="Edit"><Edit size={16}/></button>
                      <button onClick={() => onDelete(service.id)} className="p-2 hover:bg-gray-200 rounded-full" title="Hapus"><Trash2 size={16}/></button>
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServiceTable;
