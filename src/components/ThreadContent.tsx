
interface ThreadContentProps {
  content: string;
}

const ThreadContent = ({ content }: ThreadContentProps) => {
  // Check if content contains thread separators (double line breaks)
  if (!content.includes('\n\n')) {
    return <div className="text-slate-700 dark:text-slate-300">{content}</div>;
  }
  
  const threadLines = content.split('\n\n').filter(line => line.trim());
  
  return (
    <div className="relative space-y-8 animate-fade-in">
      {/* Enhanced Thread Header */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-full border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Thread • {threadLines.length} parts
          </span>
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Enhanced connecting line with animated gradient */}
      <div 
        className="absolute left-6 top-20 w-1 bg-gradient-to-b from-purple-400 via-pink-400 via-blue-400 to-purple-400 dark:from-purple-500 dark:via-pink-500 dark:via-blue-500 dark:to-purple-500 opacity-70 rounded-full shadow-sm"
        style={{ 
          height: `${Math.max(0, (threadLines.length - 1) * 120)}px`,
          background: 'linear-gradient(180deg, #a855f7 0%, #ec4899 25%, #3b82f6 50%, #ec4899 75%, #a855f7 100%)',
          animation: 'pulse 3s ease-in-out infinite'
        }}
      />
      
      {/* Enhanced decorative elements along the line */}
      {threadLines.map((_, index) => {
        if (index === threadLines.length - 1) return null;
        return (
          <div 
            key={`connector-${index}`}
            className="absolute left-5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-lg ring-2 ring-white/50 dark:ring-slate-800/50"
            style={{ 
              top: `${90 + (index * 120)}px`,
              animation: `pulse 2s ease-in-out infinite ${index * 0.3}s`
            }}
          />
        );
      })}
      
      {threadLines.map((line, index) => (
        <div 
          key={index} 
          className="flex gap-6 relative animate-fade-in"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {/* Enhanced thread number bubble */}
          <div className="flex-shrink-0 relative z-10">
            <div className="group w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl ring-4 ring-white/30 dark:ring-slate-800/30 transition-all duration-500 hover:scale-110 hover:rotate-12 hover:shadow-2xl cursor-pointer">
              <span className="transition-transform duration-300 group-hover:scale-110">
                {index + 1}
              </span>
              
              {/* Animated ring effect on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-ping" />
            </div>
            
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full blur-lg opacity-40 -z-10 animate-pulse" />
            
            {/* Floating particles effect */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Enhanced thread content */}
          <div className="flex-1 relative group">
            {/* Background card with enhanced styling */}
            <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800/90 dark:via-slate-700/80 dark:to-purple-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-purple-200/60 dark:border-purple-700/60 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
              
              {/* Animated background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent dark:via-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
              
              {/* Enhanced content text */}
              <p className="relative text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-base tracking-wide">
                {line.trim()}
              </p>
              
              {/* Multiple decorative corner accents */}
              <div className="absolute top-3 right-3 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-40 animate-pulse" />
              <div className="absolute bottom-3 left-3 w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </div>
            
            {/* Enhanced thread continuation indicator */}
            {index < threadLines.length - 1 && (
              <div className="flex items-center justify-center mt-4 mb-2">
                <div className="group px-4 py-2 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 rounded-full text-sm text-purple-700 dark:text-purple-300 font-semibold border-2 border-purple-200 dark:border-purple-700 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 backdrop-blur-sm">
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">🧵</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Thread continues
                    </span>
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce group-hover:animate-pulse" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Enhanced thread completion indicator */}
      <div className="flex items-center justify-center mt-8 animate-fade-in" style={{ animationDelay: `${threadLines.length * 0.2}s` }}>
        <div className="group px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 cursor-pointer relative overflow-hidden">
          <span className="relative flex items-center gap-3 text-sm">
            <span className="animate-pulse">✨</span>
            <span>End of Thread</span>
            <span className="animate-pulse">✨</span>
          </span>
          
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>
      </div>
      
      {/* Floating background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default ThreadContent;
