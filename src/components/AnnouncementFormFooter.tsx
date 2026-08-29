/**
 * Pie de formulario compartido para crear/editar comunicados.
 *
 * DRY: reemplaza las copias duplicadas de SubmitButton/CancelButton/FormFooter
 * que existían en NewAnnouncementPage y EditAnnouncementPage.
 *
 * OCP: cada página configura sus textos (submitLabel/successLabel) vía props;
 * agregar una nueva variante de formulario no requiere duplicar componentes.
 */
import React from 'react';
import { MAX_TOTAL_MB } from '../utils/attachmentLimits';
import type { SubmitStatus } from '../hooks/useAnnouncementForm';

interface FormFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitStatus: SubmitStatus;
  isOverLimit: boolean;
  /** Texto del botón principal (ej: «Guardar comunicado»). */
  submitLabel: string;
  /** Texto mostrado tras un guardado exitoso (ej: «¡Publicado!»). */
  successLabel: string;
}

const SubmitButton: React.FC<{
  isSubmitting: boolean;
  submitStatus: SubmitStatus;
  isOverLimit: boolean;
  submitLabel: string;
  successLabel: string;
}> = ({ isSubmitting, submitStatus, isOverLimit, submitLabel, successLabel }) => (
  <button
    className="px-8 py-2.5 rounded-lg bg-[#002b5c] text-white text-[14px] leading-5 font-normal font-bold shadow-md hover:bg-[#001736] transition-all active:scale-95 duration-150 flex items-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#002b5c]"
    type="submit"
    disabled={isSubmitting || isOverLimit}
  >
    {isOverLimit ? (
      <>
        <span className="material-symbols-outlined mr-2">lock</span>
        Límite de {MAX_TOTAL_MB} MB superado
      </>
    ) : isSubmitting ? (
      <>
        <span className="material-symbols-outlined mr-2 animate-spin">
          sync
        </span>
        Procesando...
      </>
    ) : submitStatus === 'success' ? (
      <>
        <span className="material-symbols-outlined mr-2">
          check_circle
        </span>
        {successLabel}
      </>
    ) : (
      <>
        <span
          className="material-symbols-outlined mr-2"
          style={{ fontVariationSettings: "'opsz' 20" }}
        >
          save
        </span>
        {submitLabel}
      </>
    )}
  </button>
);

const CancelButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className="px-6 py-2.5 rounded-lg border border-[#c4c6d0] text-[#001736] text-[14px] leading-5 font-normal font-semibold hover:bg-[#e6e8ea] transition-colors active:scale-95 duration-150"
    type="button"
    onClick={onClick}
  >
    Cancelar
  </button>
);

export const FormFooter: React.FC<FormFooterProps> = ({
  onCancel,
  isSubmitting,
  submitStatus,
  isOverLimit,
  submitLabel,
  successLabel,
}) => (
  <div className="pt-4 border-t border-[#c4c6d0]/20">
    {isOverLimit && (
      <div className="mb-3 flex items-start gap-2 rounded-md border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2">
        <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
          error
        </span>
        <p className="text-[12px] leading-4 text-[#93000a] flex-1">
          Se ha superado el límite de {MAX_TOTAL_MB} MB por comunicado. El
          botón «{submitLabel}» está desactivado hasta que reduzcas el
          tamaño de los adjuntos o el contenido.
        </p>
      </div>
    )}
    <div className="flex items-center justify-end space-x-4">
      <CancelButton onClick={onCancel} />
      <SubmitButton
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
        isOverLimit={isOverLimit}
        submitLabel={submitLabel}
        successLabel={successLabel}
      />
    </div>
  </div>
);

export default FormFooter;
