
const SidebarHeader = () => {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
        <img 
          src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png" 
          alt="Regal Network Logo" 
          className="h-16 w-auto mb-3 relative z-10" 
        />
      </div>
      <div>
        <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-pink-400 mb-1">
          Regal Network
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          A Global Christian Social Network
        </p>
      </div>
    </div>
  );
};

export default SidebarHeader;
