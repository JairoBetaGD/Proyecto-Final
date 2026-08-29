/**
 * Vista previa de un adjunto individual (imagen, PDF, vídeo, texto u otro).
 *
 * SRP: única responsabilidad - previsualizar UN adjunto a partir de su URL.
 * Es un componente de presentación compartido entre el listado de adjuntos
 * (`AttachmentList`) y la vista a pantalla completa
 * (`AttachmentPreviewModal`), evitando duplicar la lógica de renderizado.
 *
 * OCP: agregar un nuevo tipo de vista previa solo requiere extender
 * `getAttachmentPreviewKind` y añadir su rama de renderizado aquí.
 */
import React, { useEffect, useState } from 'react';
import type { DocumentDetail } from '../types/communicationDetail';
// SRP: la clasificación del tipo de vista previa vive en un utilitario puro.
import { getAttachmentPreviewKind } from '../utils/filePreview';

interface AttachmentPreviewProps {
  /** Adjunto a previsualizar. */
  doc: DocumentDetail;
  /**
   * Cuando es `true` (modo a pantalla completa), la vista llena el alto
   * disponible del contenedor. Por defecto usa alturas naturales/adaptativas
   * según el tipo de archivo (ideal para listas apiladas).
   */
  fit?: boolean;
}

/**
 * Descarga el contenido de archivos de texto para poder previsualizarlos.
 * El estado se asocia a la URL del documento para evitar re-descargas.
 */
const useTextContent = (doc: DocumentDetail) => {
  const [textState, setTextState] = useState<{
    url: string;
    content: string | null;
  }>({ url: '', content: null });

  useEffect(() => {
    const url = doc.url;
    if (!url || getAttachmentPreviewKind(doc) !== 'text') {
      return;
    }
    if (textState.url === url) {
      return; // Ya está cargado (o falló) para esta URL.
    }

    let cancelled = false;
    void fetch(url)
      .then((res) => res.text())
      .then((txt) => {
        if (!cancelled) {
          setTextState({ url, content: txt });
        }
      })
      .catch((error) => {
        console.error('No se pudo cargar la vista previa del archivo de texto:', error);
        if (!cancelled) {
          setTextState({ url, content: null });
        }
      });

    return () => {
      cancelled = true;
    };
    
  }, [doc, doc.url, textState.url]);

  return textState;
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  doc,
  fit = false,
}) => {
  const kind = getAttachmentPreviewKind(doc);
  const textState = useTextContent(doc);

  return (
    <div className={`w-full min-h-0 flex flex-col ${fit ? 'h-full' : ''}`}>
      {kind === 'image' && doc.url && (
        <div
          className={`flex items-center justify-center ${
            fit ? 'flex-1 min-h-0 overflow-hidden' : ''
          }`}
        >
          <img
            src={doc.url}
            alt={doc.name}
            className={`rounded-lg shadow-md ${
              fit ? 'max-w-full max-h-full object-contain' : 'max-w-full h-auto'
            }`}
          />
        </div>
      )}

      {kind === 'pdf' && doc.url && (
        <iframe
          src={doc.url}
          title={doc.name}
          className={`w-full rounded-lg border border-[#c4c6d0] bg-white ${
            fit ? 'flex-1 min-h-0' : 'h-[70vh] min-h-[420px]'
          }`}
        />
      )}

      {kind === 'video' && doc.url && (
        <div
          className={`flex items-center justify-center ${
            fit ? 'flex-1 min-h-0 overflow-hidden' : ''
          }`}
        >
          <video
            src={doc.url}
            controls
            controlsList="download"
            title={doc.name}
            preload="metadata"
            className={`rounded-lg shadow-md ${
              fit
                ? 'max-w-full max-h-full object-contain'
                : 'max-w-full h-auto max-h-[70vh]'
            }`}
          />
        </div>
      )}

      {kind === 'text' && doc.url && (
        <pre
          className={`whitespace-pre-wrap text-[13px] leading-5 text-[#001736] bg-white border border-[#c4c6d0] rounded-lg p-4 overflow-auto w-full ${
            fit ? 'flex-1 min-h-0' : 'max-h-[70vh]'
          }`}
        >
          {textState.url === doc.url
            ? textState.content ?? 'No se pudo cargar el contenido del archivo.'
            : 'Cargando vista previa...'}
        </pre>
      )}

      {kind === 'other' && (
        <div className="flex flex-col items-center justify-center h-full flex-1 text-center">
          <span className="material-symbols-outlined text-[64px] text-[#c4c6d0]">
            {doc.icon}
          </span>
          <p className="text-[16px] leading-6 font-semibold text-[#001736] mt-4">
            Este tipo de archivo no tiene vista previa
          </p>
          <p className="text-[13px] leading-5 text-[#43474f] mt-1">
            Descárgalo para verlo en tu equipo.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttachmentPreview;