// File: src/components/WhatsAppPage.jsx

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

// SERVER URL SEKARANG DIAMBIL DARI .ENV
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function WhatsAppPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('Menghubungkan ke server...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!SERVER_URL) {
      setStatusMessage('Kesalahan: URL Server belum diatur di environment variables.');
      return;
    }

    // --- INI BAGIAN YANG DIPERBAIKI ---
    // Tambahkan header khusus untuk melewati peringatan ngrok
    const socket = io(SERVER_URL, {
      extraHeaders: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    socket.on('connect', () => {
      console.log('Terhubung ke server Socket.IO!');
      setStatusMessage('Server terhubung. Menunggu QR Code...');
    });

    socket.on('qr', (url) => {
      console.log('QR Code diterima');
      setQrCodeUrl(url);
      setStatusMessage('Silakan scan QR Code dengan aplikasi WhatsApp Anda.');
      setIsConnected(false);
    });

    socket.on('ready', (message) => {
      console.log('WhatsApp siap:', message);
      setQrCodeUrl(''); 
      setStatusMessage('WhatsApp siap digunakan!');
      setIsConnected(true);
    });
    
    socket.on('message', (message) => {
      console.log('Pesan dari server:', message);
      setStatusMessage(message);
    });

    socket.on('disconnect', () => {
      console.log('Koneksi ke server terputus.');
      setStatusMessage('Koneksi terputus. Mencoba menghubungkan kembali...');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []); 

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Hubungkan WhatsApp</h1>
      <p className="text-gray-600 mb-8">Pindai QR code di bawah ini menggunakan menu "Perangkat Tertaut" di aplikasi WhatsApp Anda.</p>
      
      <div className="flex justify-center items-center h-80 bg-gray-100 rounded-lg shadow-inner">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code WhatsApp" className="w-64 h-64" />
        ) : (
          <div className="text-gray-500">
            {isConnected ? '✅ Terhubung' : '🔄 Menunggu...'}
          </div>
        )}
      </div>
      
      <p className="mt-6 font-semibold text-lg">{statusMessage}</p>

      <Link to="/" className="inline-block mt-8 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
        Kembali ke Halaman Servis
      </Link>
    </div>
  );
}

export default WhatsAppPage;
