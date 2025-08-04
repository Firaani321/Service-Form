// File: src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // <-- Impor ini

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* <-- Bungkus di sini */}
      <App />
    </BrowserRouter> {/* <-- Bungkus di sini */}
  </React.StrictMode>
);
