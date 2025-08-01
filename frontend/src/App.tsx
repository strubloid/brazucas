import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnimationProvider } from './context/AnimationContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Dashboard from './pages/Dashboard';
import AdSubmission from './pages/AdSubmission';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import { UserRole } from './types/auth';
import './styles/App.scss';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnimationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              
              {/* Temporarily simplified routes - re-enable auth later */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-ad" element={<AdSubmission />} />
            </Routes>
          </Layout>
        </Router>
      </AnimationProvider>
    </AuthProvider>
  );
};

export default App;
