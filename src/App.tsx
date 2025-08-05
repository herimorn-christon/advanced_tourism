import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import { RootState } from './store/store';

// Components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import HotelManagement from './components/Dashboard/HotelManagement';
import BookingManagement from './components/Dashboard/BookingManagement';
import UserManagement from './components/Dashboard/UserManagement';
import RoyalToursManagement from './components/Dashboard/RoyalToursManagement';
import LandingPage from './components/Landing/LandingPage';
import TourDetail from './components/Landing/TourDetail';
import HotelDetail from './components/Landing/HotelDetail';
import RoyalTourDetail from './components/Landing/RoyalTourDetail';
import ProtectedRoute from './components/ProtectedRoute';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
  );
};

const AppContent: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  // If user is authenticated, show dashboard routes
  if (token && user) {
    return (
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AnalyticsDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="hotels" element={<HotelManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="royal-tours" element={<RoyalToursManagement />} />
          <Route path="media" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Management</h2>
              <p className="text-gray-600">Upload and manage VR content for hotels and tours</p>
            </div>
          } />
          <Route path="users" element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
        <Route path="/tour/:id" element={<TourDetail />} />
        <Route path="/royal-tour/:id" element={<RoyalTourDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // If user is not authenticated, show public routes
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/hotel/:id" element={<HotelDetail />} />
      <Route path="/tour/:id" element={<TourDetail />} />
      <Route path="/royal-tour/:id" element={<RoyalTourDetail />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </Provider>
  );
};

export default App;