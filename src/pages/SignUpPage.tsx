import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CATEGORY_OPTIONS } from '../data/communications';

const fieldClass =
  'w-full bg-[#f7f9fb] border border-[#c4c6d0] rounded-lg px-4 py-3 text-[16px] leading-6 font-normal focus:ring-2 focus:ring-[#002b5c] focus:border-[#002b5c] transition-all';
const selectClass =
  'w-full bg-[#f7f9fb] border border-[#c4c6d0] rounded-lg px-4 py-3 text-[14px] leading-5 font-normal focus:ring-2 focus:ring-[#002b5c] transition-all';
const labelClass =
  'block text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return 'No fue posible crear la cuenta.';
};

const BMRegistroCuenta: React.FC = () => {
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
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

    const cleanUsername = username.trim();
    const cleanDepartment = department.trim();

    if (cleanUsername.length < 3) {
      setErrorMessage('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (!cleanDepartment) {
      setErrorMessage('Selecciona tu departamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(cleanUsername, password, cleanDepartment);
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-white">
            administrativo
          </h1>
          <p className="text-[#7594cb] text-[14px] leading-5 font-normal mt-1">
            Sistema de Comunicados · Gestión Interna
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-[22px] leading-7 font-semibold text-[#001736]">
            Crear cuenta
          </h2>
          <p className="text-[#43474f] text-[14px] leading-5 font-normal mt-1 mb-6">
            Regístrate y podrás ver los mensajes de tu departamento.
          </p>

          {errorMessage && (
            <div className="mb-4 px-4 py-3 bg-[#ffdad6] text-[#93000a] rounded-lg text-[13px] leading-[18px] font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="signup-username">
                Usuario
              </label>
              <input
                className={fieldClass}
                id="signup-username"
                name="username"
                placeholder="Ej: jperez"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="signup-password">
                Contraseña
              </label>
              <input
                className={fieldClass}
                id="signup-password"
                name="password"
                placeholder="Mínimo 4 caracteres"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="signup-confirm">
                Confirmar contraseña
              </label>
              <input
                className={fieldClass}
                id="signup-confirm"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="signup-department">
                Departamento
              </label>
              <select
                className={selectClass}
                id="signup-department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isSubmitting}
              >
                <option disabled value="">
                  Seleccionar departamento...
                </option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 rounded-lg bg-[#037300] text-[#8AFF8A] text-[14px] leading-5 font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-[#43474f] text-[14px] leading-5 font-normal mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#002b5c] font-bold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BMRegistroCuenta;