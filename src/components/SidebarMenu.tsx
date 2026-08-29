import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/' },
  { label: 'Comunicados', icon: 'campaign', path: '/Announcements' },
  { label: 'Configuración', icon: 'settings', path: '/settings' },
];

export default function SidebarMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pathname = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }

    return pathname === path || pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.role === 'admin';
  const displayName = user?.username || 'Usuario';
  const displayRole = isAdmin
    ? 'Administrador'
    : user?.department || 'Usuario';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#001736] shadow-md flex flex-col py-4 z-40">
      <div className="px-6 mb-8">
        <h1 className="text-[20px] leading-7 font-semibold font-bold text-white">
          administrativo
        </h1>
        <p className="text-[#7594cb] text-[12px] leading-4 tracking-[0.05em] font-semibold opacity-80">
          Gestión Interna
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group ${
                active
                  ? 'bg-[#037300] text-[#8AFF8A]'
                  : 'text-[#7594cb] hover:bg-[#aac7ff]/10'
              }`}
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="text-[14px] leading-5 font-normal">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-[#7594cb]/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#037300] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#8AFF8A]">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[12px] leading-4 tracking-[0.05em] font-semibold truncate">
              {displayName}
            </p>
            <p className="text-[#7594cb] text-[10px] truncate">{displayRole}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-[#7594cb] hover:bg-[#aac7ff]/10 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
