import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar    from './components/Navbar';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Brands    from './pages/Brands';
import Products  from './pages/Products';
import Sales     from './pages/Sales';
import Billing   from './pages/Billing';
import LowStock  from './pages/LowStock';

// Wrap protected routes — redirect to /login if no token
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div style={{ minHeight:'100vh', background:'#f1f5f9' }}>
    <Navbar />
    <main>{children}</main>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute><AppLayout><Products /></AppLayout></PrivateRoute>
        } />
        <Route path="/brands" element={
          <PrivateRoute><AppLayout><Brands /></AppLayout></PrivateRoute>
        } />
        <Route path="/sales" element={
          <PrivateRoute><AppLayout><Sales /></AppLayout></PrivateRoute>
        } />
        <Route path="/billing" element={
          <PrivateRoute><AppLayout><Billing /></AppLayout></PrivateRoute>
        } />
        <Route path="/low-stock" element={
          <PrivateRoute><AppLayout><LowStock /></AppLayout></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} />
  </AuthProvider>
);

export default App;
