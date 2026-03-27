import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider } from './context/AuthContext';

// Styles
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="app-container">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                    <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
                      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                      <div className="content">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/sales" element={<Sales />} />
                          <Route path="/sales/new" element={<NewSale />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
