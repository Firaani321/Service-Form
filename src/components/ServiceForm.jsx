import React from 'react';

function ServiceForm({ formData, onFormChange, onFormSubmit, isLoading }) {
  return (
    <form onSubmit={onFormSubmit}>
      <div className="form-input">
        <div className="form-group">
          <label>Nama Pelanggan</label>
          <input type="text" name="customer_name" value={formData.customer_name} onChange={onFormChange} placeholder="Contoh: Budi Santoso" required />
        </div>
        <div className="form-group">
          <label>No. Telepon</label>
          <input type="text" name="customer_phone" value={formData.customer_phone} onChange={onFormChange} placeholder="Contoh: 081234567890" />
        </div>
        <div className="form-group">
          <label>Nama Barang</label>
          <input type="text" name="item_name" value={formData.item_name} onChange={onFormChange} placeholder="Contoh: Laptop Asus ROG" required />
        </div>
        <div className="form-group">
          <label>Deskripsi Kerusakan</label>
          <input type="text" name="item_damage" value={formData.item_damage} onChange={onFormChange} placeholder="Contoh: Mati total, tidak bisa charge" />
        </div>
      </div>
      <div className="button-container">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Servis'}
        </button>
      </div>
    </form>
  );
}

export default ServiceForm;
