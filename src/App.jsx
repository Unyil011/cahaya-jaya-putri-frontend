import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Simple Route Guard using localStorage for prototype phase
const ProtectedRoute = ({ children, allowedRole }) => {
  const role = localStorage.getItem('authRole');
  if (!role) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  useEffect(() => {
    // 1. Matikan scroll mouse pada semua input number agar angka tidak berubah
    const handleWheel = (e) => {
      if (e.target && e.target.type === 'number') {
        e.preventDefault();
        e.target.blur();
      }
    };

    // 2. Cegah pengetikan tanda minus '-' atau notasi eksponen 'e'
    const handleKeyDown = (e) => {
      if (e.target && e.target.type === 'number') {
        if (e.key === '-' || e.key === 'Minus' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
        }
      }
    };

    // 3. Pencegahan jika angka minus ditempel/paste
    const handleInput = (e) => {
      if (e.target && e.target.type === 'number') {
        if (e.target.value.includes('-')) {
          e.target.value = e.target.value.replace(/-/g, '');
        }
        if (parseFloat(e.target.value) < 0) {
          e.target.value = '0';
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('input', handleInput);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Global Toast Configuration for Glassmorphism */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#1e3a8a',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          },
          success: {
            iconTheme: {
              primary: '#2563eb',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
