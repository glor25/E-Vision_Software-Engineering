import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertPopup from './AlertPopup';

interface imageArray {
  url: string;
}

interface PostProps {
  id: number;
  name: string;
  avatar: string;
  time: string;
  content: string;
  images?: imageArray[] | string[];
  commentCount: number;
  onImageClick?: (src: string) => void;
  canDelete?: boolean;
  onDelete?: (id: number) => void; // ✅ NEW PROP
}

const PostCard = ({
  id,
  name,
  avatar,
  time,
  content,
  images,
  commentCount,
  onImageClick,
  canDelete,
  onDelete,
}: PostProps) => {
  const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: '',
  });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 hover:bg-gray-50 transition w-full">
      <Link to={`/community/${id}`} className="block">
        <div className="flex items-center mb-4">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>
        <p className="mb-4 text-gray-800">{content}</p>
      </Link>

      {images && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {images.map((img, index) => {
            const src = typeof img === 'string' ? img : img.url;
            return (
              <img
                key={index}
                src={src}
                alt={`post-${id}-img-${index}`}
                className="rounded-lg object-cover cursor-pointer max-h-60 w-full"
                onClick={() => onImageClick?.(src)}
              />
            );
          })}
        </div>
      )}

      <p className="text-sm text-blue-600">💬 {commentCount} Komentar</p>

      {canDelete && (
        <button
          className="mt-2 text-red-500 hover:underline"
          onClick={async (e) => {
            e.preventDefault();
            try {
              const host: string = import.meta.env.VITE_SERVER_URL;
              await axios.delete(`${host}/posts/${id}`);
              onDelete?.(id); // ✅ notify parent
            } catch (error) {
              console.error('Failed to delete post:', error);
              setAlert({ show: true, type: 'error', message: 'Failed to delete post' });
            }
          }}
        >
          Delete
        </button>
      )}

      {alert.show && (
        <AlertPopup
          type={alert.type || 'success'}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
          duration={3000}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
