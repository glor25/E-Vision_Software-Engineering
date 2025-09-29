import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import AlertPopup from '../../components/AlertPopup';
import { validateToken } from '../../utils/ValidateToken';
import { validateMembership } from '../../utils/ValidateMembership';
import { useNavigate } from 'react-router-dom';

// const videos = Array.from({ length: 30 }, (_, index) => ({
//     id: index,
//     title: 'Strategi Meningkatkan Omzet Bisnis dengan Digital Marketing',
//     duration: '45 MENIT',
//     timeAgo: '1 Minggu lalu',
//     thumbnail: 'src/assets/videoTemplate.png', 
// }));

interface videoRequestDto {
    id: number;
    category: string;
    description: string;
    fileDuration: number;
    fileKey: string;
    filePath: string;
    name: string;
    thumbnail: string;
    title: string;
    uploadTime: string;
}

interface videoList{
    id: number;
    category?: string;
    description: string;
    duration: number;
    name: string;
    thumbnail: string;
    title: string;
    timeAgo: string;
    videoUrl: string;
    isFavorite: boolean;
}



export default function VideoFavoritLibrary() {
    const VIDEOS_PER_PAGE = 8;
    const [search, setSearch] = useState<string>('');
    const [SelectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [videos, setVideos] = useState<videoList[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalVideos, setTotalVideos] = useState<number>(0);
    const [isHovered, setIsHovered] = useState(false);
    const [userId, setuserId] = useState<number>(0);
    const limit = 10;
    const navigate = useNavigate();
    const handlePageChange = (page: number) => {
        setPage(page);
    };
    useEffect(() => {
        const token = localStorage.getItem('jwt_auth');
        if(!token) return;
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
            // const isMember = await validateMembership();
            // if(!isMember) navigate('/payment');
        };
        checkToken();
        const payload = JSON.parse(atob(token.split('.')[1]));
        setuserId(payload.userId);
        setLoading(true);
        const host: string = import.meta.env.VITE_SERVER_URL;
        axios.post(`${host}/videos/paginate`, { page: page, limit: 10, search, userId: userId, onlyFavorite: true })
            .then((res) => {
                setTotalVideos(res.data.totalVideos);
                const dataVideo:videoList[] = res.data.videos.map(async (video: videoRequestDto, index: number) => {
                    let timeAgo = '';
                    if (video.uploadTime) {
                        const uploadDate = new Date(video.uploadTime);
                        const now = new Date();
                        const diffMs = now.getTime() - uploadDate.getTime();
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffWeeks = Math.floor(diffDays / 7);
                        if (diffMins < 60) {
                            timeAgo = `${diffMins} menit lalu`;
                        } else if (diffHours < 24) {
                            timeAgo = `${diffHours} jam lalu`;
                        } else if (diffDays < 7) {
                            timeAgo = `${diffDays} hari lalu`;
                        } else {
                            timeAgo = `${diffWeeks} minggu lalu`;
                        }
                    }
                    
                    let thumbnailUrl = video.thumbnail;
                    try {
                        const response = await axios.post(`${host}/thumbnail-url`, { fileKey: video.thumbnail });
                        if (response.data && response.data.url) {
                            thumbnailUrl = response.data.url;
                        }
                    } catch (error) {
                        console.error('Failed to fetch thumbnail URL:', error);
                        return;
                    }
                    let isFavorite = false;
                    try {
                        const favoriteRes = await axios.post(`${host}/isFavorite/${video.id}/${userId}`);
                        isFavorite = favoriteRes.data?.isFavorite ?? false;
                    } catch (error) {
                        console.error('Failed to check favorite status:', error);
                    }
                    return {
                        id: video.id,
                        category: video.category,
                        description: video.description,
                        duration: video.fileDuration,
                        name: video.name,
                        thumbnail: thumbnailUrl,
                        title: video.title,
                        timeAgo,
                        videoUrl: video.fileKey,
                        isFavorite: isFavorite,
                    };
                });
                Promise.all(dataVideo).then((result) => {
                    setVideos(result);
                });
                // setVideos(dataVideo);
            })
            .finally(() => setLoading(false));
    }, [page, search, userId, navigate]);

    // const filteredVideos = videos.filter(video =>
    //     video.title.toLowerCase().includes(search.toLowerCase())
    // );

    // const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);

    
    return (
        <>
            <div className="min-h-screen bg-white">

            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 relative">
                    <input
                        type="text"
                        placeholder="Cari"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                        🔍
                    </span>
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                    <span>

                        Showing {videos.length > 0 ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + videos.length} of {totalVideos} entries
                    </span>
                    <div className="space-x-1">
                        <button
                            className="px-3 py-1 border border-gray-300 rounded text-gray-600"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-indigo-500 text-white rounded">{page}</span>
                        <button
                            className="px-3 py-1 border border-gray-300 rounded text-gray-600"
                            onClick={() => setPage((prev) => (prev * limit < totalVideos ? prev + 1 : prev))}
                            disabled={page * limit >= totalVideos}
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map(video => (
                    <div key={video.id} className="space-y-2">
                    <div className="relative">
                        <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="rounded-lg w-full h-48 object-cover"
                        />
                        <button className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="bg-opacity-50 rounded-full p-2 cursor-pointer"
                                onClick={async () => {
                                    const host: string = import.meta.env.VITE_SERVER_URL;
                                    try {
                                        const response = await axios.get(`${host}/videos/${video.id}/url`);
                                        if (response.data && response.data.url) {
                                            console.log(response.data.url)
                                            setSelectedVideo(response.data.url);
                                        } else {
                                            setAlert({ show: true, type: 'error', message: `Failed to get video URL.` });    
                                        }
                                    } catch (error) {
                                        setAlert({ show: true, type: 'error', message: `Failed to get videos : ${error}` });
                                    }
                                }}
                            >
                                ▶️
                            </div>
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 flex gap-3">
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-xs font-medium">
                            {video.duration < 60
                                ? `${video.duration} detik`
                                : video.duration < 3600
                                ? `${Math.floor(video.duration / 60)} menit`
                                : `${Math.floor(video.duration / 3600)} jam ${Math.floor((video.duration % 3600) / 60)} menit`}
                        </span>
                        <span>{video.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h2
                            className={`text-sm text-gray-800 px-2 py-1 rounded inline-block ${
                                video.category === 'Investasi'
                                    ? 'bg-blue-100 text-blue-700'
                                    : video.category === 'Pendidikan'
                                    ? 'bg-green-100 text-green-700'
                                    : video.category === 'Teknologi'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {video.category}
                        </h2>
                        <div className="ml-auto">
                            <button
                                className={`p-1 rounded-full transition ${video.isFavorite ? 'text-yellow-500' : 'hover:bg-yellow-100 text-gray-400'}`}
                                title="Add to Favorites"
                                onClick={() => {
                                    const host: string = import.meta.env.VITE_SERVER_URL;
                                    const toggleFavorite = async () => {
                                        try {
                                            const response = await axios.post(`${host}/favorite`, {
                                                videoId: video.id,
                                                userId: userId,
                                            });
                                            if (response.data) {
                                                setVideos(prevVideos =>
                                                    prevVideos.map(v =>
                                                        v.id === video.id ? { ...v, isFavorite: !v.isFavorite } : v
                                                    )
                                                );
                                                setAlert({
                                                    show: true,
                                                    type: 'success',
                                                    message: response.data.message || (video.isFavorite ? 'Removed from favorites.' : 'Added to favorites.'),
                                                });
                                            } else {
                                                setAlert({
                                                    show: true,
                                                    type: 'error',
                                                    message: response.data.message || 'Failed to toggle favorite.',
                                                });
                                            }
                                        } catch (error) {
                                            setAlert({
                                                show: true,
                                                type: 'error',
                                                message: `Failed to toggle favorite: ${error}`,
                                            });
                                        }
                                    };
                                    toggleFavorite();
                                }}
                                onMouseEnter={e => e.currentTarget.classList.add('text-yellow-500')}
                                onMouseLeave={e => !video.isFavorite && e.currentTarget.classList.remove('text-yellow-500')}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={video.isFavorite ? "#FACC15" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke={video.isFavorite ? "#FACC15" : "currentColor"}
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.538 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.783.57-1.838-.197-1.538-1.118l2.036-6.29a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <h2 className="text-sm font-semibold text-gray-800">
                        {video.title}
                    </h2>
                    <h2 className="text-sm font text-gray-800">
                        {video.description}
                    </h2>
                    
                    </div>
                ))}
                </div>
            </div>
            </div>
            {SelectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="relative">
                        <video
                            src={SelectedVideo}
                            controls
                            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
                        />
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-2 right-2 text-white text-xl bg-black bg-opacity-50 p-1 rounded-full hover:bg-opacity-80"
                        >
                        ✖
                        </button>
                    </div>
                </div>
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
        </>
    );
}
