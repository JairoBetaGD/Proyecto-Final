/**
 * Listado de mapas de Google del comunicado (guardados aparte del texto).
 *
 * SRP: exclusivamente renderiza los mapas vinculados al comunicado, uno debajo
 * de otro, junto a los archivos adjuntos en la vista de detalle. Solo admite
 * fuentes de Google Maps (misma validación que sanitizeHtml para iframes).
 */
import React from 'react';
import type { MapDetail } from '../types/communicationDetail';

interface AttachmentMapsProps {
  maps: MapDetail[];
}

/** ¿Es una URL segura de incrustación de Google Maps? */
const isGoogleMapsUrl = (url: string): boolean => {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return false;
  }
  return (
    /^https:\/\/[\w-]*\.?google\.com\/maps/i.test(trimmed) ||
    /^https:\/\/maps\.google(?:apis)?\.com(?:\/maps)?\//i.test(trimmed)
  );
};

/**
 * URL para abrir el mapa en una pestaña nueva. Los embed clásicos con
 * «output=embed» no se pueden abrir directamente (Google muestra el error
 * «must be used in an iframe»), así que se abre sin ese parámetro; para el
 * resto se busca la etiqueta en Google Maps.
 */
const mapOpenSource = (label: string, url?: string): string => {
  const target = (url || '').trim();
  if (target && /output=embed/i.test(target) && !/\/maps\/embed/i.test(target)) {
    return target.replace(/[?&]output=embed/i, '');
  }
  const query = (label || '').trim();
  if (!query || query === 'Mapa de Google Maps' || /^https?:\/\//i.test(query)) {
    // Sin término de búsqueda fiable: se abre el propio enlace (o Google Maps).
    return target || 'https://www.google.com/maps';
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const AttachmentMaps: React.FC<AttachmentMapsProps> = ({ maps }) => {
  if (!maps || maps.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {maps.map((mapItem, index) => (
        <div
          key={`${mapItem.label}-${index}`}
          className="w-full bg-white rounded-xl border border-[#c4c6d0] overflow-hidden shadow-[0_2px_8px_rgba(0,43,92,0.06)]"
        >
          {/* Cabecera del mapa */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c4c6d0] bg-[#f2f4f6]">
            <span className="material-symbols-outlined text-[16px] text-[#002b5c]">
              map
            </span>
            <p className="text-[14px] leading-5 font-semibold text-[#001736] flex-1 min-w-0 truncate">
              {mapItem.label}
            </p>
            {isGoogleMapsUrl(mapItem.url) && (
              <a
                href={mapOpenSource(mapItem.label, mapItem.url)}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir en Google Maps"
                className="text-[#002b5c] hover:bg-[#e6e8ea] cursor-pointer p-1.5 rounded-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
              </a>
            )}
          </div>

          {/* Mapa incrustado */}
          <div className="p-3 bg-[#f7f9fb]">
            {isGoogleMapsUrl(mapItem.url) ? (
              <iframe
                src={mapItem.url}
                title={`Mapa: ${mapItem.label}`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full max-w-[560px] mx-auto block border-0 rounded-lg min-h-[260px] max-h-[460px]"
                style={{ aspectRatio: '4 / 3' }}
              />
            ) : (
              <p className="text-[13px] leading-5 text-[#43474f] text-center">
                No se pudo mostrar este mapa.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentMaps;