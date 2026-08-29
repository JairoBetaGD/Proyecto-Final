import React, { useEffect } from 'react';
import SidebarMenu from '../../components/SidebarMenu';
import TopBar from '../../components/TopBar';
import { useAnnouncementForm, type AnnouncementFormData } from '../../hooks/useAnnouncementForm';
import { AnnouncementFormFields } from '../../components/AnnouncementFormFields';
import { FormFooter } from '../../components/AnnouncementFormFooter';

interface BMEditarComunicadoProps {
  embedded?: boolean;
  onCancel?: () => void;
  onSubmitSuccess?: () => void;
  initialData?: AnnouncementFormData;
  announcementId?: string;
}

const defaultFormData: AnnouncementFormData = {
  title: 'Actualización de Protocolos de Seguridad 2024',
  category: 'adm',
  priority: 'high',
  description:
    'Estimado equipo, a partir del próximo mes implementaremos nuevas medidas de seguridad en todas nuestras terminales...',
  publishImmediately: true,
  attachments: [],
  maps: [],
};

const BMEditarComunicado: React.FC<BMEditarComunicadoProps> = ({
  embedded = false,
  onCancel,
  onSubmitSuccess,
  initialData,
  announcementId,
}) => {
  const {
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
  } = useAnnouncementForm({
    initialData: initialData ?? defaultFormData,
    announcementId,
    onSubmitSuccess,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, setFormData]);

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  if (embedded) {
    return (
      <div className="w-full bg-white text-[#191c1e] font-['Inter',sans-serif] rounded-2xl">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#c4c6d0]/20 pb-4">
            <div>
              <h3 className="text-[22px] leading-[28px] font-semibold text-[#001736]">
                Editar Comunicado
              </h3>
              <p className="text-[14px] leading-5 font-normal text-[#43474f]">
                Modifica la información y vuelve a publicar el mensaje.
              </p>
            </div>
            <button
              className="text-[#43474f] hover:bg-[#eceef0] rounded-full p-2 transition-colors"
              onClick={handleCancel}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <AnnouncementFormFields
              formData={formData}
              onInputChange={handleInputChange}
              onPriorityChange={handlePriorityChange}
              onCheckboxChange={handleCheckboxChange}
              onDescriptionChange={setDescription}
              onAttachmentsChange={setFormAttachments}
              onMapsChange={setFormMaps}
            />
            <FormFooter
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              isOverLimit={isOverLimit}
              submitLabel="Guardar cambios"
              successLabel="¡Actualizado!"
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen font-['Inter',sans-serif]">
      <SidebarMenu />

      <TopBar title="Sistema de Comunicados" searchPlaceholder="Buscar comunicados...">
        <div className="flex items-center gap-4">
          <button className="text-[#43474f] hover:bg-[#e6e8ea] p-2 rounded-full transition-colors cursor-pointer relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#725c00] rounded-full border-2 border-[#f7f9fb]"></span>
          </button>
          <button className="text-[#43474f] hover:bg-[#e6e8ea] p-2 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </TopBar>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-[1440px] mx-auto flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-[12px] leading-4 tracking-[0.05em] font-semibold text-[#43474f]">
              <a className="hover:text-[#001736]" href="#">
                Comunicados
              </a>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="font-bold text-[#001736]">Editar Registro</span>
            </nav>

            {/* Main Form Card */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,43,92,0.08)] overflow-hidden border border-[#c4c6d0]/30">
              {/* Card Header Section */}
              <div className="p-8 border-b border-[#c4c6d0]/20 bg-[#001736]/5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-[#001736] flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">
                      edit_note
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-[#001736]">
                      Editar Comunicado
                    </h3>
                    <p className="text-[14px] leading-5 font-normal text-[#43474f]">
                      Modifica la información necesaria y actualiza el comunicado para
                      toda la organización.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                <AnnouncementFormFields
                  formData={formData}
                  onInputChange={handleInputChange}
                  onPriorityChange={handlePriorityChange}
                  onCheckboxChange={handleCheckboxChange}
                  onDescriptionChange={setDescription}
                  onAttachmentsChange={setFormAttachments}
                  onMapsChange={setFormMaps}
                />
                <FormFooter
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  submitStatus={submitStatus}
                  isOverLimit={isOverLimit}
                  submitLabel="Guardar cambios"
                  successLabel="¡Actualizado!"
                />
              </form>
            </div>

            {/* Guidance Note */}
            <div className="flex items-start p-4 bg-[#725c00]/10 rounded-lg border border-[#725c00]/20">
              <span className="material-symbols-outlined text-[#725c00] mr-3">
                info
              </span>
              <p className="text-[14px] leading-5 font-normal text-[#6e5900] font-medium">
                Nota: Al seleccionar una prioridad{' '}
                <span className="font-bold">Alta</span>, el sistema enviará
                automáticamente una notificación push a todos los dispositivos
                registrados en la red interna de administrativo.
              </p>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-[#001736]/5 rounded-full blur-3xl -z-10"></div>
          <div className="fixed top-32 -left-16 w-64 h-64 bg-[#725c00]/5 rounded-full blur-3xl -z-10"></div>
        </div>
      </main>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default BMEditarComunicado;