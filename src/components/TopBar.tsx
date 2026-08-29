interface TopBarProps {
  title?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export default function TopBar({
  title = 'Sistema de Comunicados',
  searchPlaceholder = 'Buscar comunicado...',
  children,
}: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-[#f7f9fb] border-b border-[#c4c6d0] flex justify-between items-center px-6 z-30">
      <h2 className="text-[20px] leading-7 font-semibold font-black text-[#001736]">
        {title}
      </h2>

      <div className="flex items-center space-x-4">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780]">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 rounded-lg border border-[#c4c6d0] bg-[#f7f9fb] text-[14px] leading-5 font-normal focus:ring-2 focus:ring-[#001736] focus:border-transparent outline-none w-64"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>

        {children}
      </div>
    </header>
  );
}
