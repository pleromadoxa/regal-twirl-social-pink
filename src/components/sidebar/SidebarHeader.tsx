
const SidebarHeader = () => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse scale-125"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-lg opacity-40 animate-pulse scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 rounded-full blur-md opacity-30"></div>
        <img 
          src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png" 
          alt="Regal Network Logo" 
          className="h-24 w-auto mb-3 relative z-10 drop-shadow-2xl" 
        />
      </div>
    </div>
  );
};

export default SidebarHeader;
