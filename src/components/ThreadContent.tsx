
interface ThreadContentProps {
  content: string;
}

const ThreadContent = ({ content }: ThreadContentProps) => {
  if (!content.includes('\n\n')) return <>{content}</>;
  
  const threadLines = content.split('\n\n').filter(line => line.trim());
  
  return (
    <div className="relative">
      {/* Connecting line for threads */}
      <div className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-purple-300 via-purple-200 to-purple-300 dark:from-purple-600 dark:via-purple-500 dark:to-purple-600 opacity-60" 
           style={{ height: `${(threadLines.length - 1) * 60}px` }}></div>
      <div className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent dark:via-slate-800 opacity-40"
           style={{ height: `${(threadLines.length - 1) * 60}px` }}></div>
      
      {/* Dotted connecting lines between thread points */}
      {threadLines.map((_, index) => {
        if (index === threadLines.length - 1) return null;
        return (
          <div 
            key={`dot-${index}`}
            className="absolute left-3.5 w-1 h-1 bg-purple-400 dark:bg-purple-500 rounded-full" 
            style={{ top: `${40 + (index * 60)}px` }}
          />
        );
      })}
      
      {threadLines.map((line, index) => (
        <div key={index} className="flex gap-3 mb-4 relative">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10 relative">
            {index + 1}
          </div>
          <div className="flex-1 text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
            {line.trim()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadContent;
