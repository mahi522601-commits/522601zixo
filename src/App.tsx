import { Routes, Route, Navigate } from 'react-router'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from 'sonner'
import Home from './pages/Home'
import AdminPanel from './pages/AdminPanel'
import Checkout from './pages/Checkout'
import AuthPage from './pages/Auth'
import About from './pages/About'
import FloatingWhatsApp from './components/FloatingWhatsApp'

// Protected Route for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? <>{children}</> : <Navigate to="/auth" />;
}
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <FloatingWhatsApp />
      </CartProvider>
    </AuthProvider>
  )
}
