import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from "axios";
import AlertPopup from '../components/AlertPopup';
import { validateToken } from '../utils/ValidateToken';


interface Comment {
    Id: number;
    name: string;
    content: string;
}

const PostDetailPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [userId , setUserId] = useState(null);
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ show: boolean; type?: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });
    const [isHovered, setIsHovered] = useState(false); 
    
    useEffect(() => {
        const checkToken = async () => {
            const isValid = await validateToken();
            if (!isValid) {
                navigate('/login');
            }
        };
        checkToken();
        const token = localStorage.getItem('jwt_auth');
        if(!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        setName(payload.name);
        setUserId(payload.userId);
        const fetchPost = async () => {
            setLoading(true);
            try {
                const host: string = import.meta.env.VITE_SERVER_URL;
                const res = await axios.get(`${host}/post/${postId}`);
                const data = res.data;
                console.log(data);
                const mappedPost = {
                    id: data.id,
                    name: data.user?.userName || 'Unknown',
                    avatar: data.user?.profile || '',
                    time: data.createdAt,
                    content: data.content,
                    images: data.pictures || [],
                    commentCount: data._count?.comments ?? 0,
                };
                setPost(mappedPost);

                const commentsRes = await axios.get(`${host}/posts/${postId}/comments`);
                console.log(commentsRes);
                if (Array.isArray(commentsRes.data)) {
                    console.log(commentsRes.data);
                    setComments(commentsRes.data.map((c: { Id: number; user?: { firstName?: string; lastName?: string }; content: string }) => ({
                        Id: c.Id,
                        name: (c.user?.firstName ? c.user.firstName : '') + ' ' + (c.user?.lastName ? c.user.lastName : '') || 'Unknown',
                        content: c.content
                    })));
                }
                // console.log(mappedPost);

            } catch (err) {
                navigate('/community');
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        if (postId) fetchPost();
    }, [postId, navigate]);

    const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('jwt_auth');
            if (!token) {
                return;
            }
            const host: string = import.meta.env.VITE_SERVER_URL;
            const res = await axios.post(
                `${host}/posts/${postId}/comments`,
                {
                    userId,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(res.data);
            if (res.status === 201) {
                // Assuming the response contains the new comment's Id
                const newCommentId = res.data.id; // fallback to timestamp if not returned
                console.log(newCommentId);
                setComments(prev => [
                    ...prev,
                    { Id: newCommentId, name, content }
                ]);
                setContent('');
                setAlert({show: true, type:'success', message: 'Komentar berhasil ditambahkan.'});
            }
        } catch (error) {
            setAlert({show: true, type:'error', message: 'Komentar gagal ditambahkan.'});
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-600">Loading...</div>;
    }

    if (!post) {
        return <div className="text-center py-20 text-gray-600">Post tidak ditemukan.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
                >
                ← Kembali
                </button>

            <h2 className="text-2xl font-bold mb-4">{post.name}</h2>
            <div className="flex items-center mb-4">
                <img src={post.avatar} alt={post.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                <p className="font-medium">{post.name}</p>
                <p className="text-sm text-gray-500">{post.time}</p>
                </div>
            </div>

            <p className="text-gray-800 mb-4">{post.content}</p>

            {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {post.images.map((img, idx) => {
                    const src = typeof img === 'string' ? img : img.url;
                    return (<img
                    key={idx}
                    src={img.url}
                    alt={`post-img-${idx}`}
                    className="rounded cursor-pointer object-cover max-h-60 w-full"
                    onClick={
                        () => {
                            setSelectedImage(src);
                            console.log(src);
                        }}
                    />
                    )})}
                </div>
            )}

            <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="font-semibold mb-4">Komentar</h3>
                <ul className="space-y-4 mb-6">
                {comments.map((comment, i) => (
                    <li key={i} className="border-b pb-2 flex justify-between items-start">
                        <div>
                            <p className="font-medium">{comment.name}</p>
                            <p className="text-gray-600 text-sm">{comment.content}</p>
                        </div>
                        {comment.name === name && (
                            <button
                                className="text-red-500 text-xs ml-4 hover:underline"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('jwt_auth');
                                        if (!token) return;
                                        const host: string = import.meta.env.VITE_SERVER_URL;
                                        // Find the comment ID (assuming comments array has an 'id' property)
                                        const commentId = comments[i].Id;
                                        console.log(commentId);
                                        await axios.delete(`${host}/posts/${postId}/comments/${commentId}`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        setComments(prev => prev.filter((_, idx) => idx !== i));
                                        setAlert({ show: true, type: 'success', message: 'Komentar dihapus.' });
                                    } catch {
                                        setAlert({ show: true, type: 'error', message: 'Gagal menghapus komentar.' });
                                    }
                                }}
                            >
                                Hapus
                            </button>
                        )}
                    </li>
                ))}
                </ul>

                <form onSubmit={handleAddComment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama</label>
                        <input
                        type="text"
                        className="mt-1 w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                        value={name}
                        readOnly
                        disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Komentar</label>
                        <textarea
                        className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Tulis komentar..."
                        rows={3}
                        required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Kirim Komentar
                    </button>
                </form>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="relative">
                    <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
                    />
                    <button
                    onClick={() => setSelectedImage(null)}
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
        </div>
    );
};

export default PostDetailPage;
