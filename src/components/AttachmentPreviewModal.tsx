/**
 * Visor a pantalla completa de un adjunto.
 *
 * SRP: únicamente previsualizar un archivo a pantalla completa (imagen, PDF,
 * vídeo, texto u otro), con acciones de descargar y cerrar. No maneja
 * navegación entre documentos: cada preview se abre desde el listado de
 * adjuntos (`AttachmentList`).
 *
 * OCP: el renderizado de la vista previa se delega en `AttachmentPreview`,
 * por lo que añadir tipos nuevos de archivo no cambia este visor.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentDetail } from '../types/communicationDetail';
import { AttachmentPreview } from './AttachmentPreview';

interface AttachmentPreviewModalProps {
  /** Adjunto en vista previa; `null` significa visor cerrado. */
  doc: DocumentDetail | null;
  onClose: () => void;
}

const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  doc,
  onClose,
}) => {
  // Cerrar con la tecla Escape mientras está abierto.
  useEffect(() => {
    if (!doc) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [doc, onClose]);

  if (!doc) {
    return null;
  }

  // Portal al <body>: evita que el stacking context (backdrop-blur / transform)
  // del contenedor altere el posicionamiento fixed del overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#001736]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#c4c6d0] bg-[#f2f4f6]">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-5 font-semibold text-[#001736] truncate">
              {doc.name}
            </p>
            <p className="text-[12px] leading-4 text-[#43474f]">
              {doc.type} • {doc.size}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {doc.url && (
              <a
                href={doc.url}
                download={doc.name}
                target="_blank"
                rel="noopener noreferrer"
                title="Descargar"
                className="p-1.5 rounded-md text-[#43474f] hover:bg-[#e6e8ea] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Cerrar vista previa"
              className="p-2 rounded-full text-[#43474f] hover:bg-[#e6e8ea] cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Cuerpo: vista previa del archivo (se adapta al alto disponible) */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#f7f9fb]">
          <div className="flex-1 overflow-hidden p-4">
            <AttachmentPreview doc={doc} fit />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AttachmentPreviewModal;