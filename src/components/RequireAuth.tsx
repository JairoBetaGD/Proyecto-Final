import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guard de rutas protegidas: mientras no haya una cuenta válida, redirige al
 * login. Renderiza la pantalla de carga mientras se valida la sesión guardada.
 */
export default function RequireAuth() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center font-['Inter',sans-serif]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#001736] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#43474f] text-[14px] leading-5 font-normal">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}