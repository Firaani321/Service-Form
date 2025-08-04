import React from 'react';

function ServiceTable({ services, onStatusChange }) {
  return (
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
              {service.customer_name}<br />
              <small>{service.customer_phone}</small>
            </td>
            <td>{service.item_name}</td>
            <td>{service.item_damage}</td>
            <td>
              <select 
                value={service.status}
                onChange={(e) => onStatusChange(service.id, e.target.value)}
                className="status-select"
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
  );
}

export default ServiceTable;
