
interface CharacterCounterProps {
  text: string;
  maxLength: number;
}

const CharacterCounter = ({ text, maxLength }: CharacterCounterProps) => {
  const getCharacterCountColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  const getProgressColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium ${getCharacterCountColor(text)}`}>
        {text.length}/{maxLength}
      </span>
      <div className="w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-purple-200 dark:text-purple-600"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${Math.min((text.length / maxLength) * 62.8, 62.8)} 62.8`}
            className={getProgressColor(text)}
          />
        </svg>
      </div>
    </div>
  );
};

export default CharacterCounter;
