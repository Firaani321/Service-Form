// File: src/components/WhatsAppPage.jsx

import React, 'useState', useEffect } from 'react';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

// --- SERVER URL SEKARANG DIAMBIL DARI .ENV ---
// Pastikan nama variabel diawali dengan REACT_APP_
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function WhatsAppPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('Menghubungkan ke server...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Memberi peringatan jika URL server belum diatur
    if (!SERVER_URL) {
      setStatusMessage('Kesalahan: URL Server belum diatur di environment variables.');
      console.error('REACT_APP_SERVER_URL tidak ditemukan di .env');
      return;
    }

    // Hubungkan ke server Replit Anda
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Terhubung ke server Socket.IO!');
      setStatusMessage('Server terhubung. Menunggu QR Code...');
    });

    // Terima QR code dari server
    socket.on('qr', (url) => {
      console.log('QR Code diterima');
      setQrCodeUrl(url);
      setStatusMessage('Silakan scan QR Code dengan aplikasi WhatsApp Anda.');
      setIsConnected(false);
    });

    // Jika sudah siap (sudah login sebelumnya atau baru saja scan)
    socket.on('ready', (message) => {
      console.log('WhatsApp siap:', message);
      setQrCodeUrl(''); // Sembunyikan QR code
      setStatusMessage('WhatsApp siap digunakan!');
      setIsConnected(true);
    });
    
    // Terima pesan status lainnya dari server
    socket.on('message', (message) => {
      console.log('Pesan dari server:', message);
      setStatusMessage(message);
    });

    socket.on('disconnect', () => {
      console.log('Koneksi ke server terputus.');
      setStatusMessage('Koneksi terputus. Mencoba menghubungkan kembali...');
      setIsConnected(false);
    });

    // Bersihkan koneksi saat komponen ditutup
    return () => {
      socket.disconnect();
    };
  }, []); // useEffect akan berjalan sekali saat komponen dimuat

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
