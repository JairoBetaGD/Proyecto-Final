import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/Announcements">Announcements</Link>
        <Link to="/NotFound">Not Found</Link>
      </nav>
      <Outlet />
    </div>
  );
}
