import React from 'react';
import type { AnnouncementFormData } from '../hooks/useAnnouncementForm';
import { CATEGORY_OPTIONS } from '../data/communications';
import type { CommunicationAttachment, CommunicationMap } from '../data/communications';
import DescriptionEditor from './DescriptionEditor';

interface AnnouncementFormFieldsProps {
  formData: AnnouncementFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPriorityChange: (value: 'low' | 'medium' | 'high') => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** ISP: operaciones semánticas en lugar del estado crudo del formulario. */
  onDescriptionChange: (html: string) => void;
  onAttachmentsChange: (attachments: CommunicationAttachment[]) => void;
  onMapsChange: (maps: CommunicationMap[]) => void;
}

const PRIORITY_OPTIONS: { value: 'low' | 'medium' | 'high'; label: string; activeColor: string }[] = [
  { value: 'low', label: 'Baja', activeColor: 'peer-checked:text-[#001736]' },
  { value: 'medium', label: 'Media', activeColor: 'peer-checked:text-[#001736]' },
  { value: 'high', label: 'Alta', activeColor: 'peer-checked:text-[#ba1a1a]' },
];

const inputClass =
  'w-full bg-[#f7f9fb] border border-[#c4c6d0] rounded-lg px-4 py-3 text-[16px] leading-6 font-normal focus:ring-2 focus:ring-[#002b5c] focus:border-[#002b5c] transition-all';

const selectClass =
  'w-full bg-[#f7f9fb] border border-[#c4c6d0] rounded-lg px-4 py-3 text-[14px] leading-5 font-normal focus:ring-2 focus:ring-[#002b5c] transition-all';

const labelClass =
  'block text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f] uppercase tracking-wider';

export const AnnouncementFormFields: React.FC<AnnouncementFormFieldsProps> = ({
  formData,
  onInputChange,
  onPriorityChange,
  onCheckboxChange,
  onDescriptionChange,
  onAttachmentsChange,
  onMapsChange,
}) => {
  return (
    <>
      {/* Field 1: Title */}
      <div className="space-y-2">
        <label className={labelClass} htmlFor="title">
          Título del Comunicado
        </label>
        <input
          className={inputClass}
          id="title"
          name="title"
          placeholder="Ej: Nueva actualización de protocolos de despacho"
          type="text"
          value={formData.title}
          onChange={onInputChange}
          required
        />
      </div>

      {/* Field 2 & 3: Grid for Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="category">
            Categoría
          </label>
          <select
            className={selectClass}
            id="category"
            name="category"
            value={formData.category}
            onChange={onInputChange}
            required
          >
            <option disabled value="">
              Seleccionar categoría...
            </option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Nivel de Prioridad</label>
          <div className="flex p-1 bg-[#eceef0] rounded-lg border border-[#c4c6d0]">
            {PRIORITY_OPTIONS.map((option) => (
              <label key={option.value} className="flex-1 text-center cursor-pointer">
                <input
                  className="sr-only peer"
                  name="priority"
                  type="radio"
                  value={option.value}
                  checked={formData.priority === option.value}
                  onChange={() => onPriorityChange(option.value)}
                />
                <div className={`py-2 rounded-md peer-checked:bg-white peer-checked:shadow-sm ${option.activeColor} text-[#43474f] text-[14px] leading-5 font-normal transition-all`}>
                  {option.label}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Field 4: Description */}
      <div className="space-y-2">
        <label className={labelClass} htmlFor="description">
          Descripción del Comunicado
        </label>
        <DescriptionEditor
          value={formData.description}
          onChange={onDescriptionChange}
          attachments={formData.attachments}
          onAttachmentsChange={onAttachmentsChange}
          maps={formData.maps}
          onMapsChange={onMapsChange}
        />
      </div>

      {/* Field 5: Publish Immediately */}
      <div className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg border border-[#c4c6d0]/50">
        <div className="flex items-center space-x-3">
          <span className="material-symbols-outlined text-[#001736]">
            schedule_send
          </span>
          <div>
            <p className="text-[14px] leading-5 font-normal font-semibold text-[#001736]">
              Publicar inmediatamente
            </p>
            <p className="text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
              El mensaje será visible por todos los usuarios al guardar.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            className="sr-only peer"
            type="checkbox"
            name="publishImmediately"
            checked={formData.publishImmediately}
            onChange={onCheckboxChange}
          />
          <div className="w-11 h-6 bg-[#c4c6d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002b5c]"></div>
        </label>
      </div>
    </>
  );
};