/**
 * Utilidades de filtrado y orden para listados de comunicados.
 *
 * SRP: la lógica de filtro/orden vive aquí, separada de las páginas.
 * OCP: agregar un criterio de orden solo requiere una entrada en SORT_OPTIONS
 * y un caso en sortCommunications.
 */
import type { Communication, CommunicationPriority } from '../data/communications';

/** Filtro de prioridad: 'all' (todas) o una prioridad concreta. */
export type PriorityFilter = 'all' | CommunicationPriority;

/** Criterios de orden disponibles: por fecha o alfabético. */
export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

/** Opciones del filtro de prioridad para <select>. */
export const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'Alta', label: 'Prioridad alta' },
  { value: 'Media', label: 'Prioridad media' },
  { value: 'Baja', label: 'Prioridad baja' },
];

/** Opciones de orden para <select>. */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Más recientes primero' },
  { value: 'date-asc', label: 'Más antiguos primero' },
  { value: 'title-asc', label: 'Alfabético A → Z' },
  { value: 'title-desc', label: 'Alfabético Z → A' },
];

/** Vista por defecto (sin filtros): todas las prioridades, más recientes primero. */
export const DEFAULT_PRIORITY_FILTER: PriorityFilter = 'all';
export const DEFAULT_SORT_OPTION: SortOption = 'date-desc';

/** Indica si el usuario aplicó algún filtro u orden distinto al predeterminado. */
export const isDefaultFilterState = (
  priority: PriorityFilter,
  sortOption: SortOption
): boolean => priority === DEFAULT_PRIORITY_FILTER && sortOption === DEFAULT_SORT_OPTION;

/**
 * Fecha interna usada para ordenar: prioriza createdAt/updatedAt y cae al
 * campo `date` visible. Devuelve 0 cuando no hay fecha utilizable.
 */
const getSortableTimestamp = (comm: Communication): number => {
  const raw = comm.createdAt || comm.updatedAt || comm.date;
  const time = raw ? new Date(raw).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
};

/** Filtra la lista por prioridad ('all' devuelve la lista intacta). */
export const filterByPriority = (
  communications: Communication[],
  priority: PriorityFilter
): Communication[] =>
  priority === DEFAULT_PRIORITY_FILTER
    ? communications
    : communications.filter((comm) => comm.priority === priority);

/** Ordena una copia de la lista según el criterio elegido (no muta el original). */
export const sortCommunications = (
  communications: Communication[],
  sortOption: SortOption
): Communication[] => {
  const sorted = [...communications];

  switch (sortOption) {
    case 'date-asc':
      return sorted.sort(
        (left, right) => getSortableTimestamp(left) - getSortableTimestamp(right)
      );
    case 'title-asc':
      return sorted.sort((left, right) =>
        left.title.localeCompare(right.title, 'es', { sensitivity: 'base' })
      );
    case 'title-desc':
      return sorted.sort((left, right) =>
        right.title.localeCompare(left.title, 'es', { sensitivity: 'base' })
      );
    case 'date-desc':
    default:
      return sorted.sort(
        (left, right) => getSortableTimestamp(right) - getSortableTimestamp(left)
      );
  }
};

/** Pipeline completo aplicado por las páginas: filtro de prioridad + orden. */
export const applyCommunicationFilters = (
  communications: Communication[],
  priority: PriorityFilter,
  sortOption: SortOption
): Communication[] =>
  sortCommunications(filterByPriority(communications, priority), sortOption);