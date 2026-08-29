import React, { useState } from 'react';
import SidebarMenu from '../../components/SidebarMenu';
import TopBar from '../../components/TopBar';
import { deleteAnnouncement } from '../../services/api';
import { StatusPill, PriorityPill } from '../../components/Badges';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
// SRP: el listado de adjuntos y el visor a pantalla completa viven en sus
// propios componentes de presentación, reutilizando `AttachmentPreview`.
import AttachmentList from '../../components/AttachmentList';
import AttachmentMaps from '../../components/AttachmentMaps';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';

// ISP/SRP: los tipos de detalle se centralizan en src/types/communicationDetail
// para que mapeadores y componentes los compartan sin duplicación.
import type {
  CommunicationDetail,
  DocumentDetail,
} from '../../types/communicationDetail';

export type { CommunicationDetail, DocumentDetail };

interface BMDetalleComunicadoProps {
  embedded?: boolean;
  onClose?: () => void;
  communication: CommunicationDetail;
  onDeleteSuccess?: () => void;
}

const BMDetalleComunicado: React.FC<BMDetalleComunicadoProps> = ({
  embedded,
  onClose,
  communication,
  onDeleteSuccess,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeCommunication = communication;
  const contentHtml = sanitizeHtml(activeCommunication.content);

  const handleBack = () => {
    if (embedded && onClose) {
      onClose();
      return;
    }
    window.history.back();
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteAnnouncement(activeCommunication.id);
      setIsDeleteModalOpen(false);
      onDeleteSuccess?.();
      if (embedded) {
        onClose?.();
      } else {
        window.history.back();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const documents = activeCommunication.documents ?? [];
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (embedded) {
    return (
      <div className="w-full bg-white text-[#191c1e] font-['Inter',sans-serif] rounded-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#c4c6d0]/20 mb-6">
            <div>
              <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase">
                Detalle de comunicado
              </p>
              <h3 className="text-[22px] leading-[28px] font-semibold text-[#001736]">
                {activeCommunication.title}
              </h3>
            </div>
            <button
              onClick={handleBack}
              className="text-[#43474f] hover:bg-[#eceef0] rounded-full p-2 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-[#e6e8ea] text-[#43474f] rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">category</span>
              {activeCommunication.category}
            </span>
            <PriorityPill priority={activeCommunication.priority} />
            <StatusPill status={activeCommunication.status} />
          </div>

          <div
            className="text-[14px] leading-6 font-normal text-[#43474f] mb-6 rich-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {documents.length > 0 && (
            <AttachmentList
              documents={documents}
              onOpenFullscreen={(index) => setPreviewIndex(index)}
            />
          )}

          {activeCommunication.maps && activeCommunication.maps.length > 0 && (
            <AttachmentMaps maps={activeCommunication.maps} />
          )}
        </div>
        <AttachmentPreviewModal
          doc={previewIndex != null ? documents[previewIndex] ?? null : null}
          onClose={() => setPreviewIndex(null)}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif]">
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

      {/* Main Content Area */}
      <main className="ml-64 pt-2 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Breadcrumbs / Back */}
          <nav
            className="flex items-center gap-2 mb-8 group cursor-pointer"
            onClick={handleBack}
          >
            <span className="material-symbols-outlined text-[#001736] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#001736] uppercase tracking-wider">
              Administración de Comunicados
            </span>
          </nav>

          {/* Content Card */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] border border-[#c4c6d0] overflow-hidden">
            {/* Card Header Decoration */}
            <div className="h-1.5 w-full bg-[#002b5c]"></div>
            <div className="p-5 md:p-10">
              {/* Badges Row */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-[#e6e8ea] text-[#43474f] rounded-full text-[12px] leading-4 tracking-[0.05em] font-semibold text-[11px] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">category</span>
                  {activeCommunication.category}
                </span>
                <PriorityPill priority={activeCommunication.priority} />
                <StatusPill status={activeCommunication.status} />
              </div>

              {/* Title */}
              <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736] mb-8 leading-tight">
                {activeCommunication.title}
              </h1>

              {/* Featured Image (if available) */}
              {activeCommunication.image && (
                <div className="w-full h-64 md:h-80 rounded-xl mb-10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001736]/40 to-transparent z-10"></div>
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={`Imagen de ${activeCommunication.title}`}
                    src={activeCommunication.image}
                  />
                </div>
              )}

              {/* Description Text */}
              <div className="max-w-none mb-12">
                <div
                  className="text-[16px] leading-6 font-normal text-[#43474f] leading-relaxed mb-6 rich-content"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-10 p-4 bg-[#f2f4f6] rounded-lg border border-[#c4c6d0]">
                <div className="w-12 h-12 rounded-full bg-[#001736] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#8AFF8A]">person</span>
                </div>
                <div>
                  <p className="text-[14px] leading-5 font-semibold text-[#001736]">
                    {activeCommunication.author.name}
                  </p>
                  {activeCommunication.author.role && (
                    <p className="text-[12px] leading-4 text-[#43474f]">
                      {activeCommunication.author.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="border-t border-[#c4c6d0] pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[11px] text-[#747780] uppercase tracking-wider mb-1">
                      Fecha de creación
                    </p>
                    <div className="flex items-center gap-2 text-[#43474f]">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span className="text-[13px] leading-[18px] font-medium">
                        {activeCommunication.createdAt}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[11px] text-[#747780] uppercase tracking-wider mb-1">
                      Última actualización
                    </p>
                    <div className="flex items-center gap-2 text-[#43474f]">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      <span className="text-[13px] leading-[18px] font-medium">
                        {activeCommunication.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 border border-[#747780] rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#001736] hover:bg-[#e6e8ea] transition-all">
                    Editar Comunicado
                  </button>
                  <button className="px-5 py-2.5 bg-[#001736] text-white rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Compartir
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 py-2.5 bg-[#ba1a1a] text-white rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold shadow-md hover:bg-[#ba1a1a]/90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Section: Linked Documents */}
          {documents.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#001736]">folder</span>
                <h2 className="text-[18px] leading-6 font-semibold text-[#001736]">
                  Archivos adjuntos
                </h2>
              </div>
              <AttachmentList
                documents={documents}
                onOpenFullscreen={(index) => setPreviewIndex(index)}
              />
            </div>
          )}

          {/* Contextual Section: Ubicaciones / Mapas */}
          {activeCommunication.maps && activeCommunication.maps.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#001736]">map</span>
                <h2 className="text-[18px] leading-6 font-semibold text-[#001736]">
                  Ubicaciones
                </h2>
              </div>
              <AttachmentMaps maps={activeCommunication.maps} />
            </div>
          )}
        </div>
      </main>

      {/* Vista previa de adjuntos */}
      <AttachmentPreviewModal
        doc={previewIndex != null ? documents[previewIndex] ?? null : null}
        onClose={() => setPreviewIndex(null)}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001736]/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-[400px] w-full overflow-hidden border border-[#c4c6d0] animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#ffdad6] text-[#93000a] rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <h2 className="text-[20px] leading-7 font-semibold text-[#001736] mb-2">
                ¿Está seguro de eliminar este comunicado?
              </h2>
              <p className="text-[14px] leading-5 font-normal text-[#43474f] mb-8">
                Esta acción no se puede deshacer y el comunicado dejará de estar
                visible para todos los usuarios.
              </p>
              <div className="flex gap-3 w-full justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 border border-[#747780] rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#001736] hover:bg-[#e6e8ea] transition-all"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-[#ba1a1a] text-white rounded-lg text-[12px] leading-4 tracking-[0.05em] font-semibold shadow-md hover:bg-[#ba1a1a]/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
        .rich-content a {
          color: #002b5c;
          text-decoration: underline;
          word-break: break-word;
        }
        .rich-content iframe {
          /* Mapas de Google insertados con el editor: se muestran siempre,
             con ancho fluido, altura cómoda y responsive, y aspecto uniforme. */
          width: 100%;
          max-width: 560px;
          height: auto;
          aspect-ratio: 4 / 3;
          min-height: 260px;
          max-height: 460px;
          border: 1px solid #c4c6d0;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0, 43, 92, 0.08);
        }
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default BMDetalleComunicado;
