import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AdminRoute from './components/AdminRoute';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import WishlistPage from './pages/WishlistPage';
import LoginRegister from './pages/LoginRegister';
import MyAccount from './pages/MyAccount';
import OrderDetails from './pages/OrderDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import TestContacts from './pages/TestContacts';
import TestContactsNew from './pages/TestContactsNew';
import InventoryDashboard from './pages/InventoryDashboard';
import NewAdminDashboard from './pages/NewAdminDashboard';
import FlipkartAdminDashboard from './pages/FlipkartAdminDashboard';
import AddProduct from './pages/AddProduct';
import SalesReport from './pages/SalesReport';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/orders" element={<MyAccount />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/test-contacts" element={<TestContacts />} />
          <Route path="/test-contacts-new" element={<TestContactsNew />} />
          <Route path="/admin" element={
            <AdminRoute>
              <FlipkartAdminDashboard />
            </AdminRoute>
          } />
          <Route path="/inventory" element={
            <AdminRoute>
              <InventoryDashboard />
            </AdminRoute>
          } />
          <Route path="/add-product" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />
          <Route path="/sales-report" element={
            <AdminRoute>
              <SalesReport />
            </AdminRoute>
          } />
      </Routes>
      <Chatbot />
    </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
