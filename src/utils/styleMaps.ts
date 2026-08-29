/**
 * Centralized style maps for communication statuses, priorities, and categories.
 * 
 * OCP: Adding a new status/priority/category only requires adding an entry here,
 * without modifying any page or component.
 */

export interface BadgeStyle {
  badge: string;
  dot?: string;
  icon?: string;
}

export const STATUS_STYLES: Record<string, BadgeStyle> = {
  Publicado: {
    badge: 'text-[#725c00]',
    dot: 'bg-[#725c00]',
    icon: 'check_circle',
  },
  Borrador: {
    badge: 'text-[#43474f]',
    dot: 'bg-[#747780]',
    icon: 'edit_note',
  },
  Archivado: {
    badge: 'text-[#747780]',
    dot: 'bg-[#747780]',
    icon: 'archive',
  },
  Programado: {
    badge: 'text-[#001736]',
    dot: 'bg-[#001736]',
    icon: 'schedule',
  },
};

export const STATUS_BADGE_STYLES: Record<string, string> = {
  Publicado: 'bg-[#93f77c] text-[#036e00]',
  Borrador: 'bg-[#e0e3e5] text-[#43474f]',
  Archivado: 'bg-[#c4c6d0] text-[#191c1e]',
  Programado: 'bg-[#d6e3ff] text-[#001b3e]',
};

export const PRIORITY_STYLES: Record<string, string> = {
  Alta: 'bg-[#ffdad6] text-[#93000a]',
  Media: 'bg-[#002b5c] text-[#7594cb]',
  Baja: 'bg-[#e0e3e5] text-[#43474f]',
};

export const PRIORITY_DOT_STYLES: Record<string, string> = {
  Alta: 'bg-[#ba1a1a]',
  Media: 'bg-[#037300]',
  Baja: 'bg-[#747780]',
};

export const CATEGORY_STYLES: Record<string, string> = {
  Administración: 'bg-[#1d2d41] text-[#d3e4fe]',
  Finanzas: 'bg-[#b7c8e1] text-[#0b1c30]',
  'Recursos Humanos': 'bg-[#ffe07c] text-[#564500]',
  Marketing: 'bg-[#ffdad6] text-[#93000a]',
  Ventas: 'bg-[#d3e4fe] text-[#38485d]',
  Operaciones: 'bg-[#d6e3ff] text-[#264779]',
  Logística: 'bg-[#037300] text-[#8AFF8A]',
  Compras: 'bg-[#aac7ff] text-[#001b3e]',
  Tecnología: 'bg-[#e0e3ff] text-[#2b1e5e]',
  Legal: 'bg-[#f5e8f9] text-[#5b1b6e]',
};

export const DEFAULT_CATEGORY_STYLE = 'bg-[#e0e3e5] text-[#191c1e]';
export const DEFAULT_STATUS_STYLE = 'text-[#43474f]';
export const DEFAULT_PRIORITY_STYLE = 'bg-[#002b5c] text-[#7594cb]';

export const getStatusStyle = (status: string): BadgeStyle =>
  STATUS_STYLES[status] ?? {
    badge: DEFAULT_STATUS_STYLE,
    dot: 'bg-[#747780]',
    icon: 'edit_note',
  };

export const getStatusBadgeStyle = (status: string): string =>
  STATUS_BADGE_STYLES[status] ?? 'bg-[#e0e3e5] text-[#43474f]';

export const getPriorityStyle = (priority: string): string =>
  PRIORITY_STYLES[priority] ?? DEFAULT_PRIORITY_STYLE;

export const getPriorityDotStyle = (priority: string): string =>
  PRIORITY_DOT_STYLES[priority] ?? 'bg-[#747780]';

export const getCategoryStyle = (category: string): string =>
  CATEGORY_STYLES[category] ?? DEFAULT_CATEGORY_STYLE;