
const SidebarHeader = () => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
        <img 
          src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png" 
          alt="Regal Network Logo" 
          className="h-24 w-auto mb-3 relative z-10" 
        />
      </div>
    </div>
  );
};

export default SidebarHeader;
