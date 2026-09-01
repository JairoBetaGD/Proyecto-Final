import React, { useState, useEffect } from 'react';
import SidebarMenu from '../../components/SidebarMenu';
import TopBar from '../../components/TopBar';
import errorImage from '../../assets/Error404.png';

/**
 * Tracks mouse position to create a subtle parallax effect on the 404 illustration.
 * SRP: Isolates the parallax mouse-tracking behavior.
 */
const useParallaxMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      setMousePosition({ x: moveX, y: moveY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};

/**
 * Controls the visibility of the redirection toast.
 * SRP: Isolates the toast visibility state machine.
 */
const useToast = (duration = 3000) => {
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = () => {
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, duration);
  };

  return { isToastVisible, showToast };
};

const BM404Page: React.FC = () => {
  const mousePosition = useParallaxMousePosition();
  const { isToastVisible, showToast } = useToast();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast();
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif] overflow-hidden">
      <SidebarMenu />

      <TopBar title="administrativo" searchPlaceholder="Buscar envíos o documentos...">
      </TopBar>

      {/* Main Content Canvas */}
      <main className="relative md:ml-64 pt-16 min-h-screen flex items-center justify-center p-6">
        {/* Background Atmospheric Effect */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d6e3ff] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#93f77c] rounded-full blur-[100px]"></div>
        </div>

        {/* 404 Section */}
        <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Professional Corporate Illustration Container */}
          <div className="relative inline-block group">
            {/* Illustration Frame */}
            <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                alt="Error 404 Illustration"
                className="w-full h-auto drop-shadow-2xl"
                src={errorImage}
                style={{
                  transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                }}
              />
            </div>
            {/* Micro-interaction Elements (Floating Plane logic) */}
            <div className="absolute -top-10 -right-10 hidden md:block">
              <span
                className="material-symbols-outlined text-[#002b5c] text-6xl opacity-10 plane-float"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                flight
              </span>
            </div>
          </div>

          {/* Error Messaging */}
          <div className="space-y-4 px-4">
            <h3 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#002b5c]">
              404 - Página no encontrada
            </h3>
            <p className="text-[16px] leading-6 font-normal text-[#43474f] max-w-lg mx-auto leading-relaxed">
              Lo sentimos, el envío que buscas parece haberse desviado de su
              ruta. La página que intentas acceder no existe o ha sido
              trasladada.
            </p>
          </div>

          {/* Primary Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              className="px-8 py-3.5 bg-[#002b5c] text-white rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-[#001736]/20 hover:-translate-y-0.5 active:scale-95 transition-all"
              href="#"
              onClick={handleDashboardClick}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Volver al Dashboard
            </a>
          </div>

          {/* Quick Links / Helpful Content */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-60">
            <div className="p-4 border border-[#c4c6d0] rounded-xl text-left space-y-2 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[#036e00]">track_changes</span>
              <p className="font-bold text-sm">Rastrear envío</p>
              <p className="text-xs">Verifica el estado de tu carga actual.</p>
            </div>
            <div className="p-4 border border-[#c4c6d0] rounded-xl text-left space-y-2 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[#036e00]">inventory</span>
              <p className="font-bold text-sm">Mis paquetes</p>
              <p className="text-xs">Accede a tu historial de recepciones.</p>
            </div>
            <div className="p-4 border border-[#c4c6d0] rounded-xl text-left space-y-2 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[#036e00]">description</span>
              <p className="font-bold text-sm">Documentación</p>
              <p className="text-xs">Guías de importación y exportación.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Success Message / Bottom Interaction Toast */}
      <div
        className={`fixed bottom-8 right-8 bg-[#2d3133] text-[#eff1f3] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-transform duration-500 z-50 ${
          isToastVisible ? 'translate-y-0' : 'translate-y-24'
        }`}
      >
        <span className="material-symbols-outlined text-[#93f77c]">check_circle</span>
        <span className="text-[14px] leading-5 font-normal">
          Redireccionando a la oficina virtual...
        </span>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-4 {
          from { 
            opacity: 0;
            transform: translateY(16px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 1s ease-out, slide-in-from-bottom-4 1s ease-out;
        }
        .plane-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
};

export default BM404Page;