import React, { useRef, useState } from 'react';
import type { CommunicationAttachment, CommunicationMap } from '../data/communications';
import {
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  MAX_TOTAL_BYTES,
  MAX_TOTAL_MB,
  formatFileSize,
} from '../utils/attachmentLimits';
import { uploadFiles } from '../services/blob';
import { resolveMapUrl } from '../services/api';

interface DescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  attachments: CommunicationAttachment[];
  onAttachmentsChange: (attachments: CommunicationAttachment[]) => void;
  /** Mapas de Google (guardados aparte del texto). */
  maps: CommunicationMap[];
  onMapsChange: (maps: CommunicationMap[]) => void;
}

type PromptKind = 'link' | 'map' | null;

/** Adjunto cuya subida al almacenamiento falló y puede reintentarse. */
interface FailedUpload {
  key: number;
  file: File;
  name: string;
  reason: string;
  retrying: boolean;
  /** Si se agregó como imagen (tipo forzado a IMAGE). */
  image: boolean;
}

// DRY: formatFileSize se reutiliza de utils/attachmentLimits
// (antes estaba duplicado aquí).

const getFileType = (fileName: string): string => {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? (parts.pop() ?? '').toUpperCase() : '';
  if (ext === 'JPEG') {
    return 'JPG';
  }
  if (ext === 'MP4' || ext === 'WEBM' || ext === 'MOV' || ext === 'AVI' || ext === 'MKV') {
    return 'VIDEO';
  }
  return ext.length > 0 && ext.length <= 4 ? ext : 'FILE';
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Dominios de Google Maps que aceptamos como fuente de un mapa.
const GOOGLE_MAPS_HOSTS = [
  'maps.google.com',
  'www.google.com',
  'google.com',
  'maps.app.goo.gl',
  'goo.gl',
];

/** ¿`host` pertenece a Google Maps (maps…/www…google.com)? */
const isGoogleMapsHost = (host: string): boolean => {
  const h = host.toLowerCase();
  return GOOGLE_MAPS_HOSTS.some(
    (allowed) => h === allowed || h.endsWith(`.${allowed}`)
  );
};

/** Extrae el `src` si el usuario pegó el snippet <iframe …> de «Insertar un mapa». */
const extractIframeSrc = (input: string): string | null => {
  if (!/<\s*iframe/i.test(input)) {
    return null;
  }
  const match = input.match(/src\s*=\s*["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
};

/** ¿Es un enlace corto de Google (pestaña «Enviar un enlace» de Compartir)? */
const isShortGoogleLink = (input: string): boolean =>
  /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl)\//i.test(input.trim());

/** Coordenadas «!3dlat!4dlng» (parámetro data de place o blob pb de embed). */
const extractDataCoords = (text: string): [string, string] | null => {
  const match = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  return match ? [match[1], match[2]] : null;
};

/**
 * Deriva una etiqueta legible del blob «pb» de un enlace /maps/embed.
 * El nombre del lugar suele viajar tras «!2s» (URL-encodado); si no aparece,
 * se usan las coordenadas del lugar o un texto genérico.
 */
const extractEmbedLabel = (url: URL): string => {
  const pb = url.searchParams.get('pb') || '';
  // Par canónico de lugar: «!1m2!1s<cid>!2s<nombre del lugar>».
  const pair = pb.match(/!1m2!1s[^!]+!2s([^!]+)/);
  const candidates: string[] = [];
  if (pair) {
    candidates.push(pair[1]);
  }
  candidates.push(...[...pb.matchAll(/!2s([^!]+)/g)].map((m) => m[1]));
  for (const raw of candidates) {
    try {
      const decoded = decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
      // Descarta CIDs («0x…»), códigos de idioma/país («en», «us») y ruido.
      if (
        decoded.length >= 3 &&
        !/^0x/i.test(decoded) &&
        !/^[a-z]{2}$/i.test(decoded)
      ) {
        return decoded;
      }
    } catch {
      // Nombre no decodificable: se prueba con el siguiente.
    }
  }
  const coords = extractDataCoords(pb);
  if (coords) {
    return `${coords[0]}, ${coords[1]}`;
  }
  return 'Mapa de Google Maps';
};

const coordsResult = (lat: string, lng: string) => {
  const coords = `${lat},${lng}`;
  return {
    embed: `https://maps.google.com/maps?q=${encodeURIComponent(
      coords
    )}&output=embed`,
    open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      coords
    )}`,
    label: `${lat}, ${lng}`,
  };
};

const queryResult = (query: string) => ({
  embed: `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`,
  open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`,
  label: query,
});

/**
 * Deriva los enlaces del mapa a partir de lo pegado por el usuario.
 *
 * Devuelve `{ embed, open, label }` o `null` si no se puede interpretar.
 * - `embed`: se usa en el `<iframe>` del detalle.
 * - `open`: se abre en una pestaña nueva (nunca con `output=embed`, que
 *   Google bloquea fuera de iframes con el error "must be used in an iframe").
 * - `label`: texto legible para la cabecera del mapa.
 *
 * Acepta: el código de «Insertar un mapa» (`/maps/embed?pb=…`, con o sin el
 * `<iframe>` que lo envuelve), la consulta (`?q=`/`?query=`), las coordenadas
 * (`@lat,lng` y `!3d…!4d…` del `data=`) y las rutas legibles
 * `/maps/place/<nombre>` o `/maps/search/<consulta>`.
 */
const parseGoogleMapsLink = (
  input: string
): { embed: string; open: string; label: string } | null => {
  const rawInput = input.trim();
  if (!rawInput) {
    return null;
  }

  // Acepta el snippet completo de «Insertar un mapa» (<iframe src="…">).
  const raw = extractIframeSrc(rawInput) ?? rawInput;

  let href = raw;
  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (!isGoogleMapsHost(url.hostname)) {
    return null;
  }

  // 0) «Insertar un mapa»: https://www.google.com/maps/embed?pb=… — es el
  //    código que ofrece el diálogo Compartir y el único garantizado en iframes.
  if (/\/maps\/embed/i.test(url.pathname)) {
    const label = extractEmbedLabel(url);
    return {
      embed: url.toString(),
      open: mapOpenSource(label, url.toString()),
      label,
    };
  }

  // 1) Parámetro de consulta explícito (?q=… o ?query=…).
  const query =
    url.searchParams.get('q')?.trim() ||
    url.searchParams.get('query')?.trim() ||
    '';

  if (query) {
    return queryResult(query);
  }

  // 2) Coordenadas exactas del lugar (!3dlat!4dlng). El parámetro data=… de
  //    Google va en el PATH (…/@lat,lng,zoom/data=…), no en el query; se
  //    examina path + query para cubrir ambos formatos.
  const dataCoords = extractDataCoords(`${url.pathname}${url.search}`);
  if (dataCoords) {
    return coordsResult(dataCoords[0], dataCoords[1]);
  }

  // 3) Coordenadas en el path de un enlace «place/…/@lat,lng,zoom» o «@lat,lng».
  const atMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return coordsResult(atMatch[1], atMatch[2]);
  }

  // 4) Si ya es un embed clásico (…&output=embed), se usa directo y se deriva
  //    el enlace de apertura sin el parámetro.
  if (/output=embed/i.test(raw)) {
    return {
      embed: raw,
      open: mapOpenSource(raw, raw),
      label: raw,
    };
  }

  // 5) Ruta legible: /maps/place/<nombre>… o /maps/search/<consulta>.
  const pathMatch = url.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/i);
  if (pathMatch) {
    let placeQuery: string;
    try {
      placeQuery = decodeURIComponent(pathMatch[1]).replace(/\+/g, ' ').trim();
    } catch {
      placeQuery = pathMatch[1].replace(/\+/g, ' ').trim();
    }
    if (placeQuery) {
      return queryResult(placeQuery);
    }
  }

  return null;
};

// URL para abrir el mapa en una pestaña nueva. Los embed clásicos con
// «output=embed» no se pueden abrir directamente (Google muestra el error
// «must be used in an iframe»), así que se abre sin ese parámetro; para el
// resto se busca la etiqueta en Google Maps.
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
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};

const toolbarButtonClass =
  'p-2 text-[#43474f] rounded-md cursor-pointer hover:text-[#001736] hover:bg-[#e6e8ea] transition-colors';

// Límites de tamaño: por archivo (15 MB) y por comunicado (15 MB en total,
// incluida la descripción). Constantes centralizadas en utils/attachmentLimits.
const MAX_FILE_SIZE_LABEL = `${MAX_FILE_MB} MB`;

/**
 * Construye el metadato del adjunto a partir del File seleccionado.
 * DRY: lo usan tanto la subida inicial como el reintento de un archivo fallido.
 */
const buildAttachment = (file: File, asImage: boolean): CommunicationAttachment => {
  const fileType = getFileType(file.name);
  let attachmentType = fileType;
  if (asImage) {
    attachmentType = 'IMAGE';
  }
  if (/^(VIDEO|MP4|WEBM|MOV|AVI|MKV)$/i.test(fileType)) {
    attachmentType = 'VIDEO';
  }
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: attachmentType,
    mimeType: file.type || '',
  };
};

// Subir un archivo a Vercel Blob y devolver la URL pública.
// La subida es directa del navegador al almacenamiento (client uploads);
// el backend solo firma la autorización (ver src/services/blob.ts).
const uploadFile = async (file: File): Promise<string> => {
  const response = await uploadFiles([file]);
  return response.files[0].url;
};

const promptButtonClass =
  'text-white bg-[#002b5c] box-border border border-transparent rounded-md hover:bg-[#001736] text-sm px-3 py-1.5 font-medium cursor-pointer';

const cancelButtonClass =
  'text-[#43474f] bg-transparent border border-[#c4c6d0] rounded-md hover:bg-[#e6e8ea] text-sm px-3 py-1.5 font-medium cursor-pointer';

const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  maps,
  onMapsChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState<PromptKind>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapResolving, setMapResolving] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [oversizedFiles, setOversizedFiles] = useState<Record<string, boolean>>({});
  // Adjuntos que no se pudieron subir al almacenamiento; se muestran con la
  // causa real y una opción de reintentar (en vez de descartarse en silencio).
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const failedUploadKeyRef = useRef(0);

  // Tamaño total del comunicado: contenido HTML. Los archivos ya no se guardan
// como binario en Mongo (se suben a Vercel Blob y se guarda la URL), por lo que
// no cuentan para el límite de documento de MongoDB.
  const totalPayloadBytes = value.length;
  const isOverTotal = totalPayloadBytes > MAX_TOTAL_BYTES;

  const insertHtml = (html: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + html + value.slice(end);
    onChange(next);

    window.setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(start + html.length, start + html.length);
    }, 0);
  };

  const confirmPrompt = async () => {
    if (prompt === 'link') {
      const url = linkUrl.trim();
      const label = linkLabel.trim();
      if (!url) {
        return;
      }
      const safeLabel = label ? label : url;
      const href =
        /^https?:\/\//i.test(url) || /^mailto:/i.test(url) ? url : `https://${url}`;
      insertHtml(
        `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          safeLabel
        )}</a>`
      );
    }

    if (prompt === 'map') {
      const link = mapLink.trim();
      if (!link) {
        setMapError('Pega el enlace o el código de inserción del mapa de Google Maps.');
        return;
      }
      setMapError(null);
      setMapResolving(true);
      try {
        // Acepta: el enlace de «Compartir» (incluido el corto maps.app.goo.gl,
        // que se resuelve en el backend porque el navegador no puede seguir la
        // redirección por CORS), el código de «Insertar un mapa» (<iframe …>)
        // o un enlace directo de Google Maps.
        const candidate = extractIframeSrc(link) ?? link;
        const source = isShortGoogleLink(candidate)
          ? await resolveMapUrl(candidate)
          : candidate;
        const parsed = parseGoogleMapsLink(source);
        if (!parsed) {
          setMapError(
            'No se pudo interpretar. Pega el enlace de «Compartir», el código de «Insertar un mapa» (<iframe …>) o un enlace de Google Maps.'
          );
          return;
        }
        // El mapa se guarda aparte del texto (en la lista de mapas del
        // comunicado) en lugar de incrustarlo como iframe dentro del contenido.
        onMapsChange([...maps, { label: parsed.label, url: parsed.embed }]);
        setPrompt(null);
        setMapLink('');
      } catch {
        setMapError(
          'No se pudo resolver el enlace corto. Pega el enlace completo o el código de «Insertar un mapa».'
        );
      } finally {
        setMapResolving(false);
      }
      return;
    }

    setPrompt(null);
    setLinkUrl('');
    setLinkLabel('');
    setMapLink('');
  };

  const cancelPrompt = () => {
    setPrompt(null);
    setLinkUrl('');
    setLinkLabel('');
    setMapLink('');
    setMapError(null);
  };

  const addFiles = async (files: FileList | null, asImage: boolean) => {
    if (!files || files.length === 0) {
      return;
    }

    setSizeError(null);

    const enriched: CommunicationAttachment[] = [];
    for (const file of Array.from(files)) {
      const attachment = buildAttachment(file, asImage);

      if (file.size <= MAX_FILE_BYTES) {
        setUploadingCount((count) => count + 1);
        try {
          attachment.url = await uploadFile(file);
          // Si este archivo había fallado antes (lista de reintento), se limpia.
          setFailedUploads((prev) => prev.filter((failed) => failed.name !== file.name));
        } catch (error) {
          console.error('No se pudo subir el archivo a Vercel Blob:', error);
          // No adjuntar archivos sin URL: quedarían inaccesibles al previsualizar.
          // Se registran en la lista de fallidos con la causa real y la opción
          // de «Reintentar», en lugar de descartarse en silencio.
          setFailedUploads((prev) => [
            ...prev,
            {
              key: ++failedUploadKeyRef.current,
              file,
              name: file.name,
              reason:
                error instanceof Error
                  ? error.message
                  : 'Error desconocido al subir el archivo.',
              retrying: false,
              image: asImage,
            },
          ]);
          continue;
        } finally {
          setUploadingCount((count) => Math.max(0, count - 1));
        }
      } else {
        setSizeError(
          `"${file.name}" supera el límite de ${MAX_FILE_SIZE_LABEL} y no se guardará en la base de datos. Solo se registra su metadato (nombre y tamaño).`
        );
        setOversizedFiles((prev) => ({ ...prev, [file.name]: true }));
      }

      enriched.push(attachment);
    }

    onAttachmentsChange([...attachments, ...enriched]);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  /** Reintenta la subida de un archivo que falló, conservando el metadato. */
  const retryUpload = async (failed: FailedUpload) => {
    const attachment = buildAttachment(failed.file, failed.image);
    setFailedUploads((prev) =>
      prev.map((item) => (item.key === failed.key ? { ...item, retrying: true } : item))
    );
    try {
      attachment.url = await uploadFile(failed.file);
      onAttachmentsChange([...attachments, attachment]);
      setFailedUploads((prev) => prev.filter((item) => item.key !== failed.key));
    } catch (error) {
      console.error('No se pudo reintentar la subida del archivo:', error);
      setFailedUploads((prev) =>
        prev.map((item) =>
          item.key === failed.key
            ? {
                ...item,
                reason:
                  error instanceof Error
                    ? error.message
                    : 'Error desconocido al subir el archivo.',
                retrying: false,
              }
            : item
        )
      );
    }
  };

  const deleteAttachment = (index: number) => {
    const removed = attachments[index];
    if (removed) {
      setOversizedFiles((prev) => {
        const next = { ...prev };
        delete next[removed.name];
        return next;
      });
    }
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  const deleteMap = (index: number) => {
    onMapsChange(maps.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-lg border border-[#c4c6d0] bg-[#f2f4f6] shadow-sm focus-within:ring-2 focus-within:ring-[#002d5c]">
      {/* Área de escritura */}
      <div className="px-4 py-2 bg-[#f2f4f6] rounded-t-lg border-b border-[#c4c6d0]">
        <textarea
          ref={textareaRef}
          id="description"
          name="description"
          rows={8}
          className="block w-full px-0 py-2 text-sm text-[#001736] bg-[#f2f4f6] border-0 focus:ring-0 resize-none min-h-[180px] placeholder:text-[#43474f]"
          placeholder="Redacta los detalles del comunicado aquí. Puedes agregar enlaces, mapas y archivos con los botones de la parte inferior..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>

      {/* Barra de herramientas inferior (adaptada del editor de comentarios) */}
      <div className="flex items-center px-3 py-2 border-t border-[#c4c6d0] flex-wrap gap-0.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files, false)}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files, true)}
        />

        <button
          type="button"
          title={`Adjuntar archivo (máx. ${MAX_FILE_SIZE_LABEL})`}
          className={toolbarButtonClass}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-[20px]">attach_file</span>
          <span className="sr-only">Adjuntar archivo</span>
        </button>

        <button
          type="button"
          title="Insertar enlace"
          className={toolbarButtonClass}
          onClick={() => setPrompt((prev) => (prev === 'link' ? null : 'link'))}
        >
          <span className="material-symbols-outlined text-[20px]">link</span>
          <span className="sr-only">Insertar enlace</span>
        </button>

        <button
          type="button"
          title="Insertar mapa de Google"
          className={toolbarButtonClass}
          onClick={() => setPrompt((prev) => (prev === 'map' ? null : 'map'))}
        >
          <span className="material-symbols-outlined text-[20px]">map</span>
          <span className="sr-only">Insertar mapa de Google</span>
        </button>

        <button
          type="button"
          title={`Subir imagen (máx. ${MAX_FILE_SIZE_LABEL})`}
          className={toolbarButtonClass}
          onClick={() => imageInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-[20px]">image</span>
          <span className="sr-only">Subir imagen</span>
        </button>

        <div
          className={`ms-auto flex items-center gap-1 text-[11px] ${
            isOverTotal ? 'text-[#ba1a1a] font-semibold' : 'text-[#747780]'
          }`}
          title="Los archivos se guardan en la base de datos (máx. 15 MB por archivo y 15 MB por comunicado, contenido incluido)"
        >
          {uploadingCount > 0 && (
            <span className="text-[#002d5c]">
              Subiendo {uploadingCount} archivo{uploadingCount === 1 ? '' : 's'}…
            </span>
          )}
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>
            Máx. {MAX_FILE_SIZE_LABEL}/archivo • {formatFileSize(totalPayloadBytes)} de{' '}
            {MAX_TOTAL_MB} MB usados
            {isOverTotal && ' · ¡Límite superado!'}
          </span>
        </div>
      </div>

      {/* Aviso cuando un archivo supera el límite de tamaño */}
      {sizeError && (
        <div className="mt-2 mx-3 flex items-start gap-2 rounded-md border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2">
          <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
            error
          </span>
          <p className="text-[12px] leading-4 text-[#93000a] flex-1">{sizeError}</p>
          <button
            type="button"
            title="Cerrar aviso"
            className="text-[#93000a] hover:text-[#ba1a1a] cursor-pointer p-0.5"
            onClick={() => setSizeError(null)}
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Archivos que no se pudieron subir al almacenamiento, con la causa
          real y la opción de reintentar o descartar */}
      {failedUploads.length > 0 && (
        <div className="mt-2 mx-3 space-y-2">
          {failedUploads.map((failed) => (
            <div
              key={failed.key}
              className="flex items-start gap-2 rounded-md border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
                error
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] leading-4 text-[#93000a] font-medium break-words">
                  No se pudo subir &quot;{failed.name}&quot; al almacenamiento. El archivo no
                  fue adjuntado.
                </p>
                <p className="text-[11px] leading-4 text-[#93000a]/90 mt-0.5 break-words">
                  {failed.reason}
                </p>
                {failed.retrying && (
                  <p className="text-[11px] leading-4 text-[#93000a] mt-0.5">
                    Reintentando…
                  </p>
                )}
              </div>
              <button
                type="button"
                title="Reintentar subida"
                className="text-[#93000a] hover:text-[#ba1a1a] cursor-pointer p-0.5 disabled:opacity-50"
                disabled={failed.retrying}
                onClick={() => retryUpload(failed)}
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
              </button>
              <button
                type="button"
                title="Descartar archivo"
                className="text-[#93000a] hover:text-[#ba1a1a] cursor-pointer p-0.5"
                onClick={() =>
                  setFailedUploads((prev) => prev.filter((item) => item.key !== failed.key))
                }
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Aviso cuando se supera el límite total por comunicado */}
      {isOverTotal && (
        <div className="mt-2 mx-3 flex items-start gap-2 rounded-md border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2">
          <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
            warning
          </span>
          <p className="text-[12px] leading-4 text-[#93000a] flex-1">
            Se superó el límite de {MAX_TOTAL_MB} MB por comunicado. El botón de
            guardar estará desactivado hasta que reduzcas los adjuntos o el
            contenido.
          </p>
        </div>
      )}

      {/* Panel de inserción de enlace */}
      {prompt === 'link' && (
        <div className="mt-2 border border-[#c4c6d0] rounded-md bg-[#f7f9fb] p-3 space-y-2">
          <p className="text-[12px] leading-4 text-[#43474f] font-semibold">
            Insertar enlace
          </p>
          <input
            type="text"
            className="w-full bg-white border border-[#c4c6d0] rounded-md px-3 py-2 text-sm text-[#001736] focus:ring-2 focus:ring-[#002d5c]"
            placeholder="https://ejemplo.com/documento"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            className="w-full bg-white border border-[#c4c6d0] rounded-md px-3 py-2 text-sm"
            placeholder="Texto visible (opcional, usa lo seleccionado si lo dejas vacío)"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={cancelButtonClass} onClick={cancelPrompt}>
              Cancelar
            </button>
            <button type="button" className={promptButtonClass} onClick={confirmPrompt}>
              Insertar enlace
            </button>
          </div>
        </div>
      )}

      {prompt === 'map' && (
        <div className="mt-2 border border-[#c4c6d0] rounded-md bg-[#f7f9fb] p-3 space-y-2">
          <p className="text-[12px] leading-4 text-[#43474f] font-semibold">
            Insertar mapa de Google
          </p>
          <p className="text-[12px] leading-4 text-[#747780]">
            Acepta el enlace de «Compartir» (incluido el corto maps.app.goo.gl),
            el código de «Insertar un mapa» (&lt;iframe …&gt;) o un enlace
            directo de Google Maps.
          </p>
          <input
            type="text"
            className="w-full bg-white border border-[#c4c6d0] rounded-md px-3 py-2 text-sm"
            placeholder="Pega el enlace o el código <iframe …> del mapa de Google Maps"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            autoFocus
          />
          {mapError && (
            <p className="text-[12px] leading-4 text-[#ba1a1a]">{mapError}</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={cancelButtonClass} onClick={cancelPrompt}>
              Cancelar
            </button>
            <button
              type="button"
              className={`${promptButtonClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              onClick={confirmPrompt}
              disabled={mapResolving}
            >
              {mapResolving ? 'Resolviendo…' : 'Insertar mapa'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de archivos adjuntos / imágenes */}
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-1.5 bg-[#eceef0] border border-[#c4c6d0] rounded-md px-2 py-1"
            >
              <span className="material-symbols-outlined text-[16px] text-[#002d5c]">
                {attachment.type === 'IMAGE' ? 'image' : 'description'}
              </span>
              <span className="text-[12px] leading-4 text-[#43474f]">
                {attachment.name}
              </span>
              {oversizedFiles[attachment.name] && (
                <span
                  className="material-symbols-outlined text-[14px] text-[#ba1a1a]"
                  title={`No se almacenó en la base de datos: supera el límite de ${MAX_FILE_SIZE_LABEL}`}
                >
                  warning
                </span>
              )}
              <span className="text-[11px] leading-4 text-[#747780]">
                {attachment.size} • {attachment.type}
              </span>
              <button
                type="button"
                title="Quitar adjunto"
                className="text-[#43474f] hover:text-[#ba1a1a] cursor-pointer p-1"
                onClick={() => deleteAttachment(index)}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lista de mapas de Google (guardados aparte del texto) */}
      {maps.length > 0 && (
        <div className="mt-2 space-y-2">
          {maps.map((mapItem, index) => (
            <div
              key={`${mapItem.label}-${index}`}
              className="flex items-center gap-2 bg-white border border-[#c4c6d0] rounded-md overflow-hidden"
            >
              <span className="material-symbols-outlined text-[18px] text-[#002d5c] ml-2">
                map
              </span>
              <span className="text-[12px] leading-4 text-[#43474f] flex-1 min-w-0 truncate">
                {mapItem.label}
              </span>
              <a
                href={mapOpenSource(mapItem.label, mapItem.url)}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir mapa"
                className="text-[#002b5c] hover:bg-[#e6e8ea] cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
              <button
                type="button"
                title="Quitar mapa"
                className="text-[#43474f] hover:text-[#ba1a1a] cursor-pointer p-1"
                onClick={() => deleteMap(index)}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;