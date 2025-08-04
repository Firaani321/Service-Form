import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

// Komponen ini HANYA menampilkan tabel, menerima data dan fungsi dari parent.
function ServiceTable({ services, onEdit, onDelete, onStatusChange }) {
  if (!services || services.length === 0) {
    return <div className="text-center py-10 text-gray-500">Tidak ada data untuk ditampilkan.</div>;
  }

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
            <tr key={service.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-xs">{service.id}</td>
              <td className="p-3">{new Date(service.created_at).toLocaleDateString('id-ID')}</td>
              <td className="p-3">{service.customer_name}<br/><small className="text-gray-500">{service.customer_phone}</small></td>
              <td className="p-3">{service.item_name}</td>
              <td className="p-3">{service.item_damage}</td>
              <td className="p-3">
                <select 
                  value={service.status} 
                  onChange={(e) => onStatusChange(service.id, e.target.value)} 
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
