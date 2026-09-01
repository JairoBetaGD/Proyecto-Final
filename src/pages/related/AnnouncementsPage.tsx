import React, { useState } from 'react';
import SidebarMenu from '../../components/SidebarMenu';
import TopBar from '../../components/TopBar';
import BMNuevoComunicado from './NewAnnouncementPage';
import BMEditarComunicado from './EditAnnouncementPage';
import BMDetalleComunicado from './ViewDetailsPage';
import { Modal } from '../../components/Modal';
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from '../../components/Badges';

import {
  getCategoryValueForForm,
  getPriorityValueForForm,
  type Communication,
} from '../../data/communications';

// SRP: el filtrado/orden de listados vive en su propia utilidad reutilizable.
import {
  applyCommunicationFilters,
  isDefaultFilterState,
  PRIORITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  type PriorityFilter,
  type SortOption,
} from '../../utils/communicationFilters';

// SRP/OCP: mapeo Communication -> detalle delegado a un mapeador puro.
import { toCommunicationListPreview } from '../../utils/communicationMappers';

import { useCommunications } from '../../hooks/useCommunications';
import { useAuth } from '../../hooks/useAuth';

const BMComunicadosFull: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    communications,
    isLoading,
    errorMessage,
    refresh,
    remove,
  } = useCommunications();

  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtros del listado: prioridad y orden (fecha o alfabético).
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const isDefaultView = isDefaultFilterState(priorityFilter, sortOption);

  const visibleCommunications: Communication[] = applyCommunicationFilters(
    communications,
    priorityFilter,
    sortOption
  );

  const handleResetFilters = () => {
    setPriorityFilter('all');
    setSortOption('date-desc');
  };

  const handleView = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsViewModalOpen(true);
  };

  const handleEdit = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (comm: Communication) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar "${comm.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await remove(comm.id);
    } catch {
      // errorMessage is already set by the hook
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const getEditInitialData = (comm: Communication) => ({
    title: comm.title,
    category: getCategoryValueForForm(comm.category),
    priority: getPriorityValueForForm(comm.priority),
    description: comm.content || '',
    publishImmediately: true,
    attachments: comm.attachments || [],
    maps: comm.maps || [],
  });

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = async () => {
    closeModal();
    await refresh();
  };

  const handleEditSuccess = async () => {
    closeModal();
    await refresh();
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif] overflow-hidden">

      <SidebarMenu />

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">

        <TopBar title="Sistema de Comunicados" />

        {/* Canvas Content */}
        <div className="pt-2 px-6 pb-8 max-w-[1440px] mx-auto">
          {/* Main Table Section */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-[#c4c6d0] bg-[#f2f4f6]">
              <h4 className="text-[20px] leading-7 font-semibold text-[#001736]">
                Listado de Comunicados
              </h4>
              <button
                onClick={handleCreate}
                className="bg-[#037300] text-[#8AFF8A] px-6 py-2 rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold flex items-center space-x-2 active:scale-95 transition-transform hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>CREAR NUEVO</span>
              </button>
            </div>

            {/* Barra de filtros: prioridad y orden */}
            <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-[#c4c6d0] bg-[#f7f9fb]">
              <span className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filtros
              </span>

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
                aria-label="Filtrar por prioridad"
                className="px-3 py-2 rounded-lg border border-[#c4c6d0] bg-white text-[13px] leading-[18px] font-medium text-[#001736] focus:ring-2 focus:ring-[#001736] outline-none"
              >
                {PRIORITY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                aria-label="Ordenar comunicados"
                className="px-3 py-2 rounded-lg border border-[#c4c6d0] bg-white text-[13px] leading-[18px] font-medium text-[#001736] focus:ring-2 focus:ring-[#001736] outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {!isDefaultView && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#93000a] hover:bg-[#ffdad6] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#eceef0]/50 text-[#43474f] text-[12px] leading-4 tracking-[0.05em] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Título</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Prioridad</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#c4c6d0]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#43474f]">
                        Cargando comunicados...
                      </td>
                    </tr>
                  ) : errorMessage ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#93000a]">
                        {errorMessage}
                      </td>
                    </tr>
                  ) : communications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#43474f]">
                        No hay comunicados registrados todavía.
                      </td>
                    </tr>
                  ) : visibleCommunications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#43474f]">
                        Ningún comunicado coincide con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    visibleCommunications.map((comm) => (
                      <tr
                        key={comm.id}
                        className="hover:bg-[#eceef0] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 text-[13px] leading-[18px] font-medium text-[#001736]">
                          {comm.title}
                        </td>
                        <td className="px-6 py-4">
                          <CategoryBadge category={comm.category} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={comm.status} withDot />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={comm.priority} />
                        </td>
                        <td className="px-6 py-4 text-[#43474f] text-[13px] leading-[18px] font-medium">
                          {comm.date}
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleView(comm)}
                            className="text-[#001736] hover:bg-[#001736]/10 p-2 rounded-full transition-colors"
                            title="Ver comunicado"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(comm)}
                                className="text-[#001736] hover:bg-[#001736]/10 p-2 rounded-full transition-colors"
                                title="Editar comunicado"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(comm)}
                                className="text-[#93000a] hover:bg-[#ffdad6] p-2 rounded-full transition-colors"
                                title="Eliminar comunicado"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-[#f2f4f6] border-t border-[#c4c6d0] flex justify-between items-center text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
              <span>
                Mostrando {visibleCommunications.length} de {communications.length} comunicados
              </span>
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
            onDeleteSuccess={handleEditSuccess}
            communication={toCommunicationListPreview(selectedCommunication)}
          />
        )}
      </Modal>

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={closeModal}>
        <div className="px-6 py-5 border-b border-[#c4c6d0] bg-white sticky top-0 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] leading-7 font-semibold text-[#001736]">
                Crear Nuevo Comunicado
              </h2>
              <p className="text-[14px] leading-5 font-normal text-[#43474f]">
                Completa la información para publicar un nuevo mensaje.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-[#43474f] hover:bg-[#eceef0] rounded-full p-2 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div className="p-2 sm:p-4">
          <BMNuevoComunicado
            embedded
            onCancel={closeModal}
            onSubmitSuccess={handleCreateSuccess}
          />
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={closeModal}>
        {selectedCommunication && (
          <BMEditarComunicado
            embedded
            onCancel={closeModal}
            onSubmitSuccess={handleEditSuccess}
            initialData={getEditInitialData(selectedCommunication)}
            announcementId={selectedCommunication.id}
          />
        )}
      </Modal>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c4c6d0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BMComunicadosFull;