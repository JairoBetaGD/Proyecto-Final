/**
 * Listado simple de adjuntos: muestra cada archivo con su vista previa apilada,
 * sin carrusel ni navegación por slider.
 *
 * SRP: exclusivamente renderizar la lista de adjuntos, uno debajo de otro, cada
 * uno en su propio contenedor. La vista previa de cada archivo se delega en
 * `AttachmentPreview` (imagen, PDF, vídeo, texto u otro).
 *
 * OCP: añadir tipos nuevos de archivo no cambia este listado.
 */
import React from 'react';
import type { DocumentDetail } from '../types/communicationDetail';
import { AttachmentPreview } from './AttachmentPreview';

interface AttachmentListProps {
  /** Archivos adjuntos del comunicado. */
  documents: DocumentDetail[];
  /** Abre la vista a pantalla completa del índice seleccionado. */
  onOpenFullscreen?: (index: number) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  documents,
  onOpenFullscreen,
}) => {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {documents.map((doc, index) => (
        <div
          key={index}
          className="w-full bg-white rounded-xl border border-[#c4c6d0] overflow-hidden shadow-[0_2px_8px_rgba(0,43,92,0.06)]"
        >
          {/* Cabecera del archivo */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c4c6d0] bg-[#f2f4f6]">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-5 font-semibold text-[#001736] truncate">
                {doc.name}
              </p>
              <p className="text-[12px] leading-4 text-[#43474f]">
                {doc.type} • {doc.size}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
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
                onClick={() => doc.url && onOpenFullscreen?.(index)}
                disabled={!doc.url}
                title="Ver a pantalla completa"
                aria-label="Ver a pantalla completa"
                className="p-1.5 rounded-md text-[#002b5c] hover:bg-[#e6e8ea] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  open_in_full
                </span>
              </button>
            </div>
          </div>

          {/* Cuerpo: vista previa del archivo */}
          <div className="p-4 bg-[#f7f9fb]">
            <AttachmentPreview doc={doc} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
