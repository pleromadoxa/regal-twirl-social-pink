
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
    <div className="relative space-y-6">
      {/* Main connecting line with gradient */}
      <div 
        className="absolute left-5 top-12 w-0.5 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-400 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500 opacity-60 rounded-full"
        style={{ height: `${Math.max(0, (threadLines.length - 1) * 80)}px` }}
      />
      
      {/* Decorative dots along the line */}
      {threadLines.map((_, index) => {
        if (index === threadLines.length - 1) return null;
        return (
          <div 
            key={`connector-${index}`}
            className="absolute left-4 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse"
            style={{ top: `${60 + (index * 80)}px` }}
          />
        );
      })}
      
      {threadLines.map((line, index) => (
        <div key={index} className="flex gap-4 relative">
          {/* Thread number bubble */}
          <div className="flex-shrink-0 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white dark:ring-slate-800 transition-transform hover:scale-110">
              {index + 1}
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-md opacity-30 -z-10" />
          </div>
          
          {/* Thread content with beautiful styling */}
          <div className="flex-1 relative">
            <div className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 dark:from-slate-800/80 dark:via-slate-700/80 dark:to-purple-900/20 backdrop-blur-sm rounded-xl p-4 shadow-md border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {line.trim()}
              </p>
              
              {/* Decorative corner accent */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20" />
            </div>
            
            {/* Thread continuation indicator */}
            {index < threadLines.length - 1 && (
              <div className="flex items-center justify-center mt-3 mb-1">
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full text-xs text-purple-600 dark:text-purple-400 font-medium border border-purple-200 dark:border-purple-700">
                  🧵 Thread continues
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Thread completion indicator */}
      <div className="flex items-center justify-center mt-4">
        <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium shadow-lg">
          ✨ End of Thread
        </div>
      </div>
    </div>
  );
};

export default ThreadContent;
