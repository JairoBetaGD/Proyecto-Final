import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const fieldClass =
  'w-full bg-[#f7f9fb] border border-[#c4c6d0] rounded-lg px-4 py-3 text-[16px] leading-6 font-normal focus:ring-2 focus:ring-[#002b5c] focus:border-[#002b5c] transition-all';
const labelClass =
  'block text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return 'No fue posible iniciar sesión.';
};

const BMIniciarSesion: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Usuario y contraseña son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#001736] text-[#191c1e] font-['Inter',sans-serif] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-[#037300]/20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-[#725c00]/20 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="text-center mb-8">
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-white">
            administrativo
          </h1>
          <p className="text-[#7594cb] text-[14px] leading-5 font-normal mt-1">
            Sistema de Comunicados · Gestión Interna
          </p>
        </div>

        {/* Tarjeta */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-[22px] leading-7 font-semibold text-[#001736]">Iniciar sesión</h2>
          <p className="text-[#43474f] text-[14px] leading-5 font-normal mt-1 mb-6">
            Accede para ver los comunicados de tu departamento.
          </p>

          {errorMessage && (
            <div className="mb-4 px-4 py-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-[13px] leading-[18px] font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="login-username">
                Usuario
              </label>
              <input
                className={fieldClass}
                id="login-username"
                name="username"
                placeholder="Tu usuario"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="login-password">
                Contraseña
              </label>
              <input
                className={fieldClass}
                id="login-password"
                name="password"
                placeholder="Tu contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 rounded-lg bg-[#037300] text-[#8AFF8A] text-[14px] leading-5 font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Cuenta de administrador (demo) */}
          <div className="mt-6 px-4 py-3 bg-[#001736]/5 border border-[#001736]/10 rounded-lg">
            <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#001736]">
              Cuenta de administrador (demo)
            </p>
            <p className="text-[#43474f] text-[13px] leading-[18px] font-medium mt-1">
              Usuario: <span className="font-bold">admin</span> · Contraseña:{' '}
              <span className="font-bold">admin123</span>
            </p>
          </div>

          <p className="text-center text-[#43474f] text-[14px] leading-5 font-normal mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/signup" className="text-[#002b5c] font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BMIniciarSesion;