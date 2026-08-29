import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import AnnouncementsPage from './pages/related/AnnouncementsPage';
import NotFound from './pages/related/NotFound';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Páginas públicas de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Rutas protegidas: requieren una cuenta válida */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/Announcements" element={<AnnouncementsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/NotFound" element={<NotFound />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
