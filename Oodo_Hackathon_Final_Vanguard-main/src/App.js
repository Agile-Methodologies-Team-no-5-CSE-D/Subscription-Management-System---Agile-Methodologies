import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import InternalUserDashboard from './InternalUserDashboard';
import PortalHomePage from './PortalHomePage';
import ShopPage from './ShopPage';
import CartPage from './CartPage';
import UserDetailsPage from './UserDetailsPage';
import OrdersPage from './OrdersPage';
import OrderPage from './OrderPage';
import InvoicePage from './InvoicePage';
import ProductPage from './ProductPage';
import { getStoredUser } from './authService';
import './App.css';

const RoleBasedRedirect = () => {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin' || user.role === 'internal_staff') {
    return <InternalUserDashboard />;
  }

  return <Navigate to="/portal/home" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forget-password" element={<LoginPage />} />
          <Route path="/" element={<RoleBasedRedirect />} />
          {/* <Route path="/home-alternate" element={<Home />} /> */}

          {/* Portal User Routes */}
          <Route path="/portal/home" element={<PortalHomePage />} />
          <Route path="/portal/shop" element={<ShopPage />} />
          <Route path="/portal/cart" element={<CartPage />} />
          <Route path="/portal/account" element={<UserDetailsPage />} />
          <Route path="/portal/orders" element={<OrdersPage />} />
          <Route path="/portal/order/:id" element={<OrderPage />} />
          <Route path="/portal/invoices" element={<InvoicePage />} />
          <Route path="/portal/invoice/:id" element={<InvoicePage />} />
          <Route path="/portal/product/:id" element={<ProductPage />} />

          {/* Redirect any unknown route to the dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
