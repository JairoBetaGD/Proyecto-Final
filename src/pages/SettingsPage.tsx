/**
 * Página de Configuración.
 *
 * SRP: la página solo compone secciones; la lógica del tema vive en
 * ThemeContext y el interruptor en ToggleSwitch.
 */
import React, { useState } from 'react';
import SidebarMenu from '../components/SidebarMenu';
import TopBar from '../components/TopBar';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

/** Interruptor accesible (role="switch") con perilla animada. */
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
  disabled?: boolean;
}> = ({ checked, onChange, ariaLabel, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? 'bg-[#037300]' : 'bg-[#c4c6d0]'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-[#f0f3f6] shadow transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

interface SettingRowProps {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, children }) => (
  <div className="flex items-center justify-between gap-4 px-6 py-5">
    <div className="flex items-start gap-4 min-w-0">
      <div className="w-10 h-10 shrink-0 rounded-lg bg-[#001736]/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#001736]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[14px] leading-5 font-semibold text-[#001736]">{title}</p>
        <p className="text-[13px] leading-[18px] font-normal text-[#43474f]">
          {description}
        </p>
      </div>
    </div>
    {children}
  </div>
);

const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Preferencias de notificaciones (de sesión; la persistencia llega próximamente).
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const isAdmin = user?.role === 'admin';
  const accountRole = isAdmin ? 'Administrador' : user?.department || 'Usuario';

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif]">
      <SidebarMenu />

      <TopBar title="Configuración" searchPlaceholder="Buscar en configuración..." />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-[1440px] mx-auto">
          <div className="mb-8">
            <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736]">
              Configuración
            </h1>
            <p className="text-[16px] leading-6 font-normal text-[#43474f]">
              Personaliza la apariencia y las preferencias de tu cuenta
            </p>
          </div>

          <div className="max-w-3xl space-y-6">
            {/* Apariencia */}
            <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]/30">
              <header className="px-6 py-4 border-b border-[#c4c6d0] bg-[#f2f4f6]">
                <h2 className="text-[16px] leading-6 font-semibold text-[#001736] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">palette</span>
                  Apariencia
                </h2>
              </header>

              <div className="divide-y divide-[#c4c6d0]">
                <SettingRow
                  icon={isDark ? 'dark_mode' : 'light_mode'}
                  title="Modo oscuro"
                  description={
                    isDark
                      ? 'Activado: la interfaz usa colores oscuros. Tu preferencia se guarda en este navegador.'
                      : 'Desactivado: cambia la interfaz a colores oscuros para reducir el cansancio visual.'
                  }
                >
                  <ToggleSwitch
                    checked={isDark}
                    onChange={toggleTheme}
                    ariaLabel="Activar o desactivar el modo oscuro"
                  />
                </SettingRow>
              </div>
            </section>

            {/* Cuenta */}
            <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]/30">
              <header className="px-6 py-4 border-b border-[#c4c6d0] bg-[#f2f4f6]">
                <h2 className="text-[16px] leading-6 font-semibold text-[#001736] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                  Cuenta
                </h2>
              </header>

              <div className="divide-y divide-[#c4c6d0]">
                <SettingRow
                  icon="person"
                  title="Usuario"
                  description="Nombre de cuenta con el que iniciaste sesión."
                >
                  <span className="text-[14px] font-semibold text-[#001736] truncate max-w-[180px]">
                    {user?.username || 'Usuario'}
                  </span>
                </SettingRow>

                <SettingRow
                  icon={isAdmin ? 'admin_panel_settings' : 'apartment'}
                  title={isAdmin ? 'Rol' : 'Departamento'}
                  description={
                    isAdmin
                      ? 'Tienes privilegios completos: ver, crear, editar y eliminar comunicados de todos los departamentos.'
                      : 'Puedes ver los comunicados publicados para tu departamento.'
                  }
                >
                  <span className="px-3 py-1 rounded-full bg-[#001736]/10 text-[#001736] text-[12px] leading-4 tracking-[0.05em] font-semibold whitespace-nowrap">
                    {accountRole}
                  </span>
                </SettingRow>
              </div>
            </section>

            {/* Notificaciones */}
            <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]/30">
              <header className="px-6 py-4 border-b border-[#c4c6d0] bg-[#f2f4f6]">
                <h2 className="text-[16px] leading-6 font-semibold text-[#001736] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  Notificaciones
                </h2>
              </header>

              <div className="divide-y divide-[#c4c6d0]">
                <SettingRow
                  icon="notifications_active"
                  title="Notificaciones push"
                  description="Avisos en el navegador cuando se publique un comunicado de alta prioridad."
                >
                  <ToggleSwitch
                    checked={pushEnabled}
                    onChange={() => setPushEnabled((value) => !value)}
                    ariaLabel="Activar o desactivar notificaciones push"
                  />
                </SettingRow>

                <SettingRow
                  icon="mail"
                  title="Resumen por correo"
                  description="Recibe un resumen diario con los comunicados de tu departamento."
                >
                  <ToggleSwitch
                    checked={emailEnabled}
                    onChange={() => setEmailEnabled((value) => !value)}
                    ariaLabel="Activar o desactivar el resumen por correo"
                  />
                </SettingRow>
              </div>

              <footer className="px-6 py-3 bg-[#725c00]/10 border-t border-[#725c00]/20">
                <p className="text-[12px] leading-4 font-medium text-[#6e5900]">
                  Las preferencias de notificaciones se guardarán próximamente.
                </p>
              </footer>
            </section>

            {/* Acerca de */}
            <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]/30">
              <header className="px-6 py-4 border-b border-[#c4c6d0] bg-[#f2f4f6]">
                <h2 className="text-[16px] leading-6 font-semibold text-[#001736] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  Acerca de
                </h2>
              </header>

              <div className="px-6 py-5">
                <p className="text-[14px] leading-5 font-semibold text-[#001736]">
                  administrativo · Sistema de Comunicados
                </p>
                <p className="text-[13px] leading-[18px] font-normal text-[#43474f] mt-1">
                  Gestión Interna — Versión 1.0.0
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
