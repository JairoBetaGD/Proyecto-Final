import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import AnnouncementsPage from './pages/related/AnnouncementsPage';
import NotFound from './pages/related/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/Announcements" element={<AnnouncementsPage />} />
          <Route path="/NotFound" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
