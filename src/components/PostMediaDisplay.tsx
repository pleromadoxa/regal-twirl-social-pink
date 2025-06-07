
import PostVideo from './PostVideo';

interface PostMediaDisplayProps {
  imageUrls: string[];
  className?: string;
}

const PostMediaDisplay = ({ imageUrls, className = "" }: PostMediaDisplayProps) => {
  if (!imageUrls || imageUrls.length === 0) return null;

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
           url.includes('video') || url.match(/\.(mp4|webm|ogg|mov|avi)(\?|$)/i);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {imageUrls.map((url, index) => (
        <div key={index}>
          {isVideo(url) ? (
            <PostVideo videoUrl={url} />
          ) : (
            <img
              src={url}
              alt={`Post media ${index + 1}`}
              className="w-full rounded-lg object-cover max-h-96"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PostMediaDisplay;
