/**
 * Hook for managing the announcement creation/edit form state and submission.
 *
 * SRP: Separates form state, validation, and submission logic from UI rendering.
 * La construcción del payload HTTP vive en `utils/announcementPayload.ts`
 * (mapeador puro reutilizable).
 * DIP: Depends on the api service abstraction (createAnnouncement/updateAnnouncement),
 * not on concrete implementations.
 */
import { useState } from 'react';
import {
  createAnnouncement,
  updateAnnouncement,
} from '../services/api';
import type { CommunicationAttachment, CommunicationMap } from '../data/communications';
import { buildAnnouncementPayload } from '../utils/announcementPayload';
import { MAX_TOTAL_BYTES } from '../utils/attachmentLimits';

export interface AnnouncementFormData {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  publishImmediately: boolean;
  attachments: CommunicationAttachment[];
  /** Mapas de Google del comunicado (guardados aparte del texto). */
  maps: CommunicationMap[];
}

export type SubmitStatus = 'idle' | 'success' | 'error';

export const EMPTY_FORM_DATA: AnnouncementFormData = {
  title: '',
  category: '',
  priority: 'medium',
  description: '',
  publishImmediately: true,
  attachments: [],
  maps: [],
};

interface UseAnnouncementFormOptions {
  initialData?: AnnouncementFormData;
  announcementId?: string;
  onSubmitSuccess?: () => void;
}

interface UseAnnouncementFormResult {
  formData: AnnouncementFormData;
  isSubmitting: boolean;
  submitStatus: SubmitStatus;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handlePriorityChange: (value: 'low' | 'medium' | 'high') => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  /** Reemplaza el formulario completo (usado al sincronizar datos de edición). */
  setFormData: React.Dispatch<React.SetStateAction<AnnouncementFormData>>;
  /** ISP: operaciones semánticas en lugar de exponer el estado crudo. */
  setDescription: (html: string) => void;
  setFormAttachments: (attachments: CommunicationAttachment[]) => void;
  setFormMaps: (maps: CommunicationMap[]) => void;
  isOverLimit: boolean;
  totalPayloadBytes: number;
}

export function useAnnouncementForm({
  initialData,
  announcementId,
  onSubmitSuccess,
}: UseAnnouncementFormOptions = {}): UseAnnouncementFormResult {
  const [formData, setFormData] = useState<AnnouncementFormData>(
    initialData ?? EMPTY_FORM_DATA
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const handleInputChange: UseAnnouncementFormResult['handleInputChange'] = (
    e
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriorityChange = (value: 'low' | 'medium' | 'high') => {
    setFormData((prev) => ({
      ...prev,
      priority: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Operaciones semánticas (ISP): los componentes de UI piden exactamente lo
  // que necesitan en lugar de manipular el estado completo del formulario.
  const setDescription = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const setFormAttachments = (attachments: CommunicationAttachment[]) => {
    setFormData((prev) => ({ ...prev, attachments }));
  };

  const setFormMaps = (maps: CommunicationMap[]) => {
    setFormData((prev) => ({ ...prev, maps }));
  };

  // Tamaño total del comunicado: contenido HTML. Los archivos ya no se guardan
// como binario en Mongo (se suben a Vercel Blob y se guarda la URL), por lo que
// no cuentan para el límite de documento de MongoDB. Solo se valida el contenido.
  const totalPayloadBytes = formData.description.length;
  const isOverLimit = totalPayloadBytes > MAX_TOTAL_BYTES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOverLimit) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // SRP: el mapeo formulario -> contrato HTTP vive en el mapeador puro.
    const payload = buildAnnouncementPayload(formData);

    try {
      if (announcementId) {
        await updateAnnouncement(announcementId, payload);
      } else {
        await createAnnouncement(payload);
      }

      setSubmitStatus('success');
      if (!announcementId) {
        setFormData(EMPTY_FORM_DATA);
      }
      onSubmitSuccess?.();
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData ?? EMPTY_FORM_DATA);
  };

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleInputChange,
    handlePriorityChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
    setFormData,
    setDescription,
    setFormAttachments,
    setFormMaps,
    isOverLimit,
    totalPayloadBytes,
  };
}