import { useState } from 'react';
import PostCard from '../components/PostCard';
import MiniNavbar from '../components/miniNavbart';
import Navbar from '../components/Navbar';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateToken } from '../utils/ValidateToken';
import { validateMembership } from '../utils/ValidateMembership';


interface Post {
    id: number;
    name: string;
    avatar: string;
    time: string;
    userId: number;
    content: string;
    images?: string[];
    commentCount: number;
}

interface CommunityPageProps {
    isAdmin?: boolean;
}



// Optional: helper to format date for display (e.g., "1 jam yang lalu" style)
const formatTime = (isoString: string) => {
    const now = new Date();
    const time = new Date(isoString);
    const diffMs = now.getTime() - time.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
};


const CommunityPage = ({isAdmin} : CommunityPageProps) => {
    const [postText, setPostText] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false); 
    const [posts, setPosts] = useState<Post[]>([]);
    const [userId, setuserId] = useState<number>(0);
    const navigate = useNavigate();
    
    const handleDeletePost = (postId: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setAlert({ show: true, type: 'success', message: 'Post deleted successfully.' });
    };


    const fetchPosts = async () => {
        try {
            const host: string = import.meta.env.VITE_SERVER_URL;
            const response = await axios.get(`${host}/posts`);
            console.log(response);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedPosts = response.data.signedPosts.map((item: any) => ({
            id: item.id,
                name: item.user?.userName || 'Unknown',
                avatar: item.user?.profile || '',
                time: item.createdAt,
                userId: item.userId,
                content: item.content,
                images: item.pictures || [],
                commentCount: item._count?.comments ?? 0,
            }));
            setPosts(mappedPosts);
            
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setAlert({ show: true, type: 'error', message: 'Failed to fetch post ' });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImageFiles(prev => [...prev, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...previews]);
    };

    const handleDeleteImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePostSubmit = async () => {
        if (postText.trim() === '') return;
        const token = localStorage.getItem('jwt_auth');
            if(!token) return;
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.userId;
            console.log(userId);
            const host: string = import.meta.env.VITE_SERVER_URL
            await axios.post(`${host}/posts`, (() => {
                const formData = new FormData();
                formData.append('title', '');
                formData.append('content', postText);
                formData.append('userId', isAdmin ? 888 : userId);
                imageFiles.forEach(file => formData.append('pictures', file));
                return formData;
            })(), {
                headers: {
                'Content-Type': 'multipart/form-data'
                }
            })
            .then(() => {
                setAlert({ show: true, type: 'success', message: 'Post created successfully.' });
                fetchPosts();
            })
            .catch(err => {
                console.log(err)
                setAlert({ show: true, type: 'error', message: 'Failed to create post ' });
            });
        setPostText('');
        setImageFiles([]);
        setPreviewImages([]);
    };
    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
            if(!isAdmin){
                const isMember = await validateMembership();
                if(!isMember) navigate('/payment');
            }
            
        };
        checkToken();
        const token = localStorage.getItem('jwt_auth');
        if(!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        setuserId(payload.userId);
        fetchPosts();
        
    }, [navigate]);
    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    };

    // Sort posts accordingly
    const sortedPosts = [...posts].sort((a, b) => {
        if (sortOrder === 'desc') {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        } else {
            return new Date(a.time).getTime() - new Date(b.time).getTime();
        }
    });

    return (
        <>
            <MiniNavbar />
            <Navbar message="Belum punya Akun?" buttonMessage="Daftar Sekarang" route={"/signup"} />
            <div className="bg-[#F9FAFB] min-h-screen">
                <div className="bg-[#1B1545] text-white text-center py-16">
                    <h1 className="text-3xl font-bold">Community</h1>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-12">
                    {/* Create Post */}
                    <div className="bg-white p-6 rounded-lg shadow mb-10">
                        <h2 className="text-lg font-semibold mb-4">POSTINGAN BARU</h2>
                        <textarea
                            placeholder="Apa yang sedang kamu pikirkan?"
                            className="w-full border-b p-2 outline-none mb-4 resize-none"
                            rows={3}
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            <label className="cursor-pointer border border-gray-300 rounded px-3 py-1 flex items-center gap-2 hover:border-blue-500 transition">
                                📷 Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <button
                                onClick={handlePostSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Kirim
                            </button>
                        </div>

                        {previewImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {previewImages.map((src, idx) => {
                                    console.log('Preview image src:', src);
                                    return (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={src}
                                                alt={`preview-${idx}`}
                                                className="rounded max-h-40 object-cover w-full"
                                            />
                                            <button
                                                onClick={() => handleDeleteImage(idx)}
                                                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-2 text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                title="Hapus Gambar"
                                                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={toggleSortOrder}
                            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Urutkan: {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                        </button>
                    </div>

                    {/* Posts sorted by datetime descending */}
                    {sortedPosts.map((post) => {
                        console.log(userId)
                        return (
                            <PostCard
                                key={post.id}
                                {...post}
                                time={formatTime(post.time)}
                                canDelete={Number(post.userId) === Number(userId) || isAdmin}
                                onDelete={handleDeletePost}
                            />
                        );
                    })}
                </div>
            </div>
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
};

export default CommunityPage;
