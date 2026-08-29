import React, { useState } from 'react';
import SidebarMenu from '../components/SidebarMenu';
import TopBar from '../components/TopBar';
import { useCommunications } from '../hooks/useCommunications';
// SRP: la verificación de salud del backend vive en su propio hook.
import { useBackendHealth } from '../hooks/useBackendHealth';
// SRP/OCP: el mapeo Communication -> detalle vive en un mapeador puro reutilizable.
import { toCommunicationDetail } from '../utils/communicationMappers';
import {
  CategoryBadge,
  PriorityDot,
  StatusBadge,
} from '../components/Badges';
import BMDetalleComunicado from './related/ViewDetailsPage';
import { Modal } from '../components/Modal';
import {
  type Communication,
} from '../data/communications';

const BMComunicadosDashboard: React.FC = () => {
  const { communications, isLoading: isLoadingCommunications } = useCommunications();

  // Estado de salud del backend delegado al hook especializado.
  const { backendStatus, backendMessage } = useBackendHealth();

  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleView = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
  };

  const recentCommunications: Communication[] =
    [...communications]
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt || left.updatedAt || 0).getTime();
        const rightDate = new Date(right.createdAt || right.updatedAt || 0).getTime();
        return rightDate - leftDate;
      })
      .slice(0, 5);

  const publishedCount = communications.filter(
    (item) => item.status === 'Publicado'
  ).length;

  const draftCount = communications.filter(
    (item) => item.status === 'Borrador'
  ).length;

  const highPriorityCount = communications.filter(
    (item) => item.priority === 'Alta'
  ).length;

  return (
    <div className="min-h-screen text-[#191c1e] bg-[#f7f9fb] font-['Inter',sans-serif]">
      <SidebarMenu />

      <TopBar title="Sistema de Comunicados">
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#001736] hover:bg-[#e6e8ea] transition-colors rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-[#001736] hover:bg-[#e6e8ea] transition-colors rounded-full">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </TopBar>

      <main className="pl-64 pt-2 min-h-screen">
        <div className="max-w-[1440px] mx-auto p-8">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736]">
                Panel de Control
              </h1>
              <p className="text-[16px] leading-6 font-normal text-[#43474f]">
                Gestión integral de comunicaciones corporativas
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#747780] rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#191c1e] hover:bg-[#e6e8ea] transition-all">
                Exportar Reporte
              </button>
              <button className="px-4 py-2 bg-[#037300] text-[#8AFF8A] rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold font-bold shadow-md hover:brightness-95 transition-all">
                Filtros Avanzados
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] border-t-4 border-[#001736] group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#001736]/5 rounded-lg text-[#001736]">
                  <span className="material-symbols-outlined text-[32px]">folder_open</span>
                </div>
              </div>
              <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider">
                Total de comunicados
              </p>
              <p className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736] mt-1">
                {communications.length}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] border-t-4 border-[#001736] group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#001736]/5 rounded-lg text-[#001736]">
                  <span className="material-symbols-outlined text-[32px]">send</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1 text-[12px] leading-4 tracking-[0.05em] font-semibold ${backendStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>{backendStatus === 'online' ? 'En línea' : 'Sin conexión'}</span>
                  </div>
                  <span className="text-[10px] text-[#43474f] mt-1">{backendMessage}</span>
                </div>
              </div>
              <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider">
                Publicados
              </p>
              <p className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736] mt-1">
                {publishedCount}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] border-t-4 border-[#001736] group hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#001736]/5 rounded-lg text-[#001736]">
                  <span className="material-symbols-outlined text-[32px]">edit_note</span>
                </div>
              </div>
              <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider">
                Borradores
              </p>
              <p className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736] mt-1">
                {draftCount}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] border-t-4 border-[#fdd000] group hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#fdd000]/10 -mr-8 -mt-8 rounded-full"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#fdd000]/20 rounded-lg text-[#8a6400]">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                </div>
                <span className="bg-[#fdd000] text-[#8a6400] px-2 py-1 rounded text-[10px] font-bold">
                  ACCION REQUERIDA
                </span>
              </div>
              <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider">
                Alta prioridad
              </p>
              <p className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736] mt-1">
                {highPriorityCount}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#c4c6d0] flex justify-between items-center bg-[#f2f4f6]">
              <h3 className="text-[20px] leading-7 font-semibold text-[#001736]">
                Últimos cinco comunicados publicados
              </h3>
              <a href="/Announcements">
                <button className="text-[#001736] text-[12px] leading-4 tracking-[0.05em] font-semibold flex items-center gap-1 hover:underline">
                  Ver todos{' '}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-[#c4c6d0]">
                    <th className="px-8 py-4 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
                      TÍTULO
                    </th>
                    <th className="px-6 py-4 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
                      CATEGORÍA
                    </th>
                    <th className="px-6 py-4 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
                      PRIORIDAD
                    </th>
                    <th className="px-6 py-4 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
                      ESTADO
                    </th>
                    <th className="px-6 py-4 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] text-right">
                      FECHA DE CREACIÓN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]">
                  {isLoadingCommunications ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-[#43474f]">
                        Cargando comunicados...
                      </td>
                    </tr>
                  ) : recentCommunications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-[#43474f]">
                        No hay comunicados para mostrar.
                      </td>
                    </tr>
                  ) : (
                    recentCommunications.map((comm) => (
                      <tr
                        key={comm.id}
                        onClick={() => handleView(comm)}
                        className="hover:bg-[#f2f4f6] transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-[14px] leading-5 font-normal font-bold text-[#001736] group-hover:text-[#002b5c]">
                              {comm.title}
                            </span>
                            {comm.author && (
                              <span className="text-[12px] text-[#43474f]">
                                {comm.author}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <CategoryBadge category={comm.category} />
                        </td>
                        <td className="px-6 py-5">
                          <PriorityDot priority={comm.priority} />
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={comm.status} />
                        </td>
                        <td className="px-6 py-5 text-right text-[13px] leading-[18px] font-medium text-[#43474f]">
                          {comm.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* VIEW MODAL */}
      <Modal isOpen={isViewModalOpen} onClose={closeModal} maxWidth="max-w-3xl">
        {selectedCommunication && (
          <BMDetalleComunicado
            embedded
            onClose={closeModal}
            onDeleteSuccess={closeModal}
            communication={toCommunicationDetail(selectedCommunication)}
          />
        )}
      </Modal>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default BMComunicadosDashboard;