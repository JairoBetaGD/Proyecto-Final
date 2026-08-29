export type CommunicationStatus = 'Publicado' | 'Borrador' | 'Archivado' | 'Programado';
export type CommunicationPriority = 'Alta' | 'Media' | 'Baja';

/**
 * Fuente única de verdad para las categorías de comunicados.
 *
 * OCP: agregar una categoría solo requiere una entrada en este mapa; las
 * opciones del formulario y los mapeadores se derivan automáticamente.
 * Antes esta información estaba triplicada (mapa inverso con ifs,
 * mapa directo y CATEGORY_OPTIONS en AnnouncementFormFields).
 */
export const CATEGORY_MAP: Record<string, string> = {
  adm: 'Administración',
  fin: 'Finanzas',
  rh: 'Recursos Humanos',
  mkt: 'Marketing',
  ven: 'Ventas',
  ope: 'Operaciones',
  log: 'Logística',
  com: 'Compras',
  it: 'Tecnología',
  leg: 'Legal',
};

/** Código usado como categoría por defecto cuando no hay coincidencia. */
export const DEFAULT_CATEGORY_CODE = 'adm';

/**
 * Alias históricos aceptados al convertir una etiqueta a código.
 * Incluyen nombres de departamentos anteriores (específicos/anticuados) para
 * que los comunicados ya guardados sigan mapeando correctamente al editar.
 */
const CATEGORY_LABEL_ALIASES: Record<string, string> = {
  Sistemas: 'it',
  TI: 'it',
  RRHH: 'rh',
  'Servicio al cliente': 'ven',
  Counter: 'ven',
  Almacén: 'log',
  Digitación: 'ope',
  Devolución: 'log',
  Sucursales: 'ven',
  Contabilidad: 'fin',
};

/** Opciones para <select>, derivadas del mapa (no duplicarlas a mano). */
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP).map(
  ([value, label]) => ({ value, label })
);

export interface CommunicationAttachment {
  name: string;
  size: string;
  type: string;
  /** MIME type del archivo (ej: "application/pdf"). */
  mimeType?: string;
  /** URL pública del archivo en Vercel Blob. Mongo solo registra este enlace. */
  url?: string;
}

/** Mapa de Google vinculado al comunicado (se guarda aparte del texto). */
export interface CommunicationMap {
  /** Texto/dirección que identifica el mapa. */
  label: string;
  /** URL pública de incrustación de Google Maps. */
  url: string;
}

export interface Communication {
  id: string;
  title: string;
  category: string;
  status: CommunicationStatus;
  priority: CommunicationPriority;
  date: string;
  author?: string;
  content?: string;
  attachments?: CommunicationAttachment[];
  /** Mapas de Google del comunicado (separados del contenido). */
  maps?: CommunicationMap[];
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const communicationsData: Communication[] = [
  {
    id: '1',
    title: 'Actualización de Protocolos de Seguridad 2024',
    category: 'Logística',
    status: 'Publicado',
    priority: 'Alta',
    date: '12 May 2024',
    author: 'Pedro Sánchez',
    code: 'COM-2024-089',
    content:
      'Estimado equipo de administrativo, <br/><br/> A partir del 1 de junio de 2024, estaremos implementando una serie de actualizaciones críticas en nuestros protocolos de seguridad operativa para todas las terminales y centros de distribución. Estos cambios responden a los nuevos estándares internacionales de logística segura y buscan fortalecer la integridad de nuestra cadena de suministro.<br/><br/> <strong>Puntos clave de la actualización:</strong><br/> 1. Implementación de doble factor de autenticación para acceso a áreas de carga restringida.<br/> 2. Nuevas rondas de inspección digitalizada mediante dispositivos móviles integrados al sistema central.<br/> 3. Protocolos reforzados para la gestión de mercancías peligrosas y envíos de alto valor.<br/> 4. Actualización del manual de respuesta ante incidentes para reducir tiempos de reacción en un 20%.<br/><br/> Es imperativo que todo el personal operativo complete el módulo de capacitación virtual antes de la fecha mencionada. La seguridad es nuestra prioridad número uno y el cumplimiento de estos protocolos garantiza la excelencia en el servicio que brindamos a nuestros clientes corporativos.<br/><br/> Quedamos a su disposición para cualquier duda a través de la oficina de cumplimiento normativo.',
    attachments: [
      { name: 'Manual_Seguridad_2024.pdf', size: '2.4 MB', type: 'PDF' },
      { name: 'Infografia_Protocolos.jpg', size: '1.1 MB', type: 'JPG' },
    ],
  },
  {
    id: '2',
    title: 'Nuevo Horario de Atención - Sucursal Este',
    category: 'Operaciones',
    status: 'Publicado',
    priority: 'Baja',
    date: '10 May 2024',
    author: 'Equipo de Operaciones',
    content: 'Se informa el cambio de horario de atención para la sucursal este.',
    maps: [
      {
        label: 'Sucursal Este, Santo Domingo',
        url: 'https://maps.google.com/maps?q=Santo%20Domingo%2C%20Dominican%20Republic&output=embed',
      },
    ],
  },
  {
    id: '3',
    title: 'Cierre por Mantenimiento Plataforma Web',
    category: 'Tecnología',
    status: 'Borrador',
    priority: 'Media',
    date: '08 May 2024',
    author: 'Equipo de Tecnología',
    content: 'Se realizará mantenimiento programado para la plataforma web.',
  },
  {
    id: '4',
    title: 'Nuevas regulaciones de importación aérea',
    category: 'Compras',
    status: 'Publicado',
    priority: 'Alta',
    date: '12 Oct 2023',
    author: 'Pedro Sánchez',
    content: 'Se actualizan las regulaciones aplicables a importaciones aéreas.',
  },
  {
    id: '5',
    title: 'Actualización mantenimiento de servidores',
    category: 'Tecnología',
    status: 'Borrador',
    priority: 'Media',
    date: '10 Oct 2023',
    author: 'Equipo de Tecnología',
    content: 'Se actualizará la infraestructura de servidores corporativos.',
  },
];

export const formatDisplayDate = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const isString = (val: unknown): val is string => typeof val === 'string';
const isArray = (val: unknown): val is unknown[] => Array.isArray(val);

const normalizePriority = (priority?: string): CommunicationPriority => {
  if (priority === 'Alta' || priority === 'Media' || priority === 'Baja') {
    return priority;
  }

  return 'Media';
};

export const normalizeCommunication = (item: Record<string, unknown> = {}): Communication => ({
  id: String(item._id ?? item.id ?? ''),
  title: isString(item.title) ? item.title : '',
  category: isString(item.category) ? item.category : 'Administración',
  status: (isString(item.status) ? item.status : 'Publicado') as CommunicationStatus,
  priority: normalizePriority(isString(item.priority) ? item.priority : undefined),
  date: formatDisplayDate(
    (isString(item.createdAt) && item.createdAt) ||
    (isString(item.updatedAt) && item.updatedAt) ||
    (isString(item.date) && item.date) ||
    undefined
  ),
  author: isString(item.author) ? item.author : 'Equipo administrativo',
  content: isString(item.content) ? item.content : '',
  attachments: isArray(item.attachments)
      ? (item.attachments as CommunicationAttachment[]).map((attachment) => ({
          name: isString(attachment.name) ? attachment.name : '',
          size: isString(attachment.size) ? attachment.size : '',
          type: isString(attachment.type) ? attachment.type : '',
          mimeType: isString(attachment.mimeType) ? attachment.mimeType : undefined,
          url: isString(attachment.url) ? attachment.url : undefined,
        }))
      : [],
  maps: isArray(item.maps)
      ? (item.maps as CommunicationMap[]).map((mapItem) => ({
          label: isString(mapItem.label) ? mapItem.label : '',
          url: isString(mapItem.url) ? mapItem.url : '',
        }))
      : [],
  code: isString(item.code) ? item.code : '',
  createdAt: isString(item.createdAt) ? item.createdAt : (isString(item.date) ? item.date : undefined),
  updatedAt: isString(item.updatedAt) ? item.updatedAt : (isString(item.date) ? item.date : undefined),
});

export const getCategoryValueForForm = (category: string): string => {
  if (CATEGORY_LABEL_ALIASES[category]) {
    return CATEGORY_LABEL_ALIASES[category];
  }

  // Búsqueda inversa sobre el mapa único (OCP): no hay que tocar esta función
  // al agregar categorías nuevas.
  const entry = Object.entries(CATEGORY_MAP).find(([, label]) => label === category);
  return entry ? entry[0] : DEFAULT_CATEGORY_CODE;
};

export const getPriorityValueForForm = (priority: CommunicationPriority | string) => {
  if (priority === 'Alta') {
    return 'high' as const;
  }

  if (priority === 'Media') {
    return 'medium' as const;
  }

  return 'low' as const;
};

export const mapCategoryToApiValue = (value: string) =>
  CATEGORY_MAP[value] || CATEGORY_MAP[DEFAULT_CATEGORY_CODE];

export const mapPriorityToApiValue = (value: string) => {
  const priorityMap: Record<string, CommunicationPriority> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

  return priorityMap[value] || 'Media';
};

/** Devuelve el ícono Material Symbols adecuado según el tipo de adjunto. */
export const getFileIcon = (type?: string): string => {
  const t = (type || '').toUpperCase();
  if (t === 'IMAGE' || /^(PNG|JPG|JPEG|GIF|WEBP|SVG|BMP|HEIC)$/.test(t)) {
    return 'image';
  }
  if (t === 'PDF') {
    return 'picture_as_pdf';
  }
  if (/^(DOC|DOCX|XLS|XLSX|PPT|PPTX|TXT|MD|CSV|JSON|LOG|XML|HTML|RTF)$/.test(t)) {
    return 'description';
  }
  if (/^(ZIP|RAR|7Z|TAR|GZ)$/.test(t)) {
    return 'folder_zip';
  }
  return 'insert_drive_file';
};
