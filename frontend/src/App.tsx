import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// import { AnimationProvider } from './context/AnimationContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import AdSubmission from './pages/AdSubmission';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './types/auth';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            
            {/* Protected routes for admins */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes for advertisers */}
            <Route 
              path="/submit-ad" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADVERTISER]}>
                  <AdSubmission />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
